const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')
const Blog = require('./models/Blog');
const User = require('./models/User');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
const { response } = require('express');
const { findById } = require('./models/Blog');
require('dotenv').config();
const app = express();
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']
// middleware
app.use(express.static('public'));
app.use('/uploads',express.static('uploads'));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }));
// view engine
app.set('view engine', 'ejs');

// database connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true })
  .then((result) => app.listen(process.env.PORT || 3000))
  .catch((err) => console.log(err));

// blog routes
app.get('*',checkUser);
app.get('/',(req, res) =>  {
  Blog.find().sort({ createdAt: -1 }).populate("user").exec((err,blogs) => {
    if(err)
      res.status(400).send(err);
    else 
    {
      res.render('home',{ blogs: blogs});
    }  
  })
});

app.get('/createblog/:id',requireAuth,(req,res)=> {
  const id = req.params.id;
  Blog.find({user:id}).sort({ createdAt: -1}).populate("user").exec((err,userblogs)=>{
    if(err)
      res.status(400).send(err);
    else{
      res.render('createblog',{userblogs:userblogs});
    }  
  })
});
app.get('/deleteblog/:id',requireAuth,(req,res)=>{
  const id = req.params.id;
  Blog.findByIdAndDelete(id)
    .then(result=>{
      res.redirect('/');
    })
    .catch(err=>{
      res.status(400).send(err);
    })
});
app.get('/deleteuser/:id',requireAuth,async (req,res)=>{
    const id = req.params.id;
    try {
      const deleted = await User.deleteOne({_id: id});
    } catch(e) {
      console.error(`[error] ${e}`);
      throw Error('Error occurred while deleting Person');
    }
    User.findByIdAndDelete(id)
    .then(result=>{
      res.redirect('/');
    })
    .catch(err=>{
      res.status(400).send(err);
    });
});
app.post('/postblog',requireAuth,(req,res)=>{
  let blog = new Blog({
    topic: req.body.topic,
    snippet: req.body.snippet,
    content: req.body.content,
    user: req.body.id
  })
  if(req.body.blogimage)
  {
    const blogImageData = JSON.parse(req.body.blogimage);
    if(blogImageData != null && imageMimeTypes.includes(blogImageData.type))
    {
      blog.blogimage = new Buffer.from(blogImageData.data,'base64');
      blog.blogimageType = blogImageData.type;
    }
    
  }
    blog.save()
    .then(response => {
      res.redirect('/');
    })
    .catch(error=>{
      res.status(400).json({
        message: 'An error occurred' 
      })
    })
});
app.get('/blog-content/:id',(req,res)=>{
  const id = req.params.id;
  Blog.findById(id).populate('user')
    .then(result=>{
      res.render('blogcontent',{ blog: result});
    })
    .catch(err=>{
      res.status(400).send(err);
    })
});
app.get('/editblog/:id',requireAuth,(req,res)=>{
  const id = req.params.id;
  Blog.findById(id)
  .then(result=>{
    res.render('editblog',{ blog: result });
  })
  .catch(err=>{
    res.status(400).send(err);
  })
 
})
app.post('/editblog',requireAuth,(req,res)=>{
  const { id,topic,snippet, content } = req.body;
  Blog.findById(id)
    .then(blog =>{
      blog.topic = topic;
      blog.snippet = snippet;
      blog.content = content;

      blog.save()
        .then((blog)=>{
          res.status(201).json({blogid:blog._id});
        })
        .catch(err => res.status(400).json({errors: err}));
    })
    .catch(err => res.status(400).json( {errors: err} ));
})

app.post('/like',requireAuth,(req,res)=>{
  Blog.findByIdAndUpdate(req.body.blogId,{
    $push:{likes:req.body.userId}
  },{
    new:true
  }).exec((err,result)=>{
    if(err){
      return res.status(422).json({error:err})
    }
    else{
      res.redirect(`/blog-content/${req.body.blogId}`);
    }
  })
})
app.post('/unlike',requireAuth,(req,res)=>{
  Blog.findByIdAndUpdate(req.body.blogId,{
    $pull:{likes:req.body.userId}
  },{
    new:true
  }).exec((err,result)=>{
    if(err){
      return res.status(422).json({error:err})
    }
    else{
      res.redirect(`/blog-content/${req.body.blogId}`);
    }
  })
})
// authentication routes
app.use(authRoutes);

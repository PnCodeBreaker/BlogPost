const mongoose = require('mongoose');
const blogSchema = new mongoose.Schema({
   topic: {
      type: String,
      required:true
   },
   snippet: {
      type: String,
      required:true
   },
   content: {
      type: String,
      required:true
   },
   blogimage: String,
   user:{
      required:true,
      type: mongoose.Schema.Types.ObjectId,
      ref:'user'
   }
},{ timestamps: true });

const Blog = mongoose.model('blog',blogSchema);

module.exports = Blog;
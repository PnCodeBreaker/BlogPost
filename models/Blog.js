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
   blogimage: Buffer,
   blogimageType: String,
   user:{
      required:true,
      type: mongoose.Schema.Types.ObjectId,
      ref:'user'
   }
},{ timestamps: true });

blogSchema.virtual('blogimagePath').get(function() {
   if (this.blogimage != null && this.blogimageType != null) {
     return `data:${this.blogimageType};charset=utf-8;base64,${this.blogimage.toString('base64')}`
   }
 })

const Blog = mongoose.model('blog',blogSchema);

module.exports = Blog;
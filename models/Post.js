const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  title : {type : String, required : true},// title with type string and made it required
  desc : String,
  file : {type : mongoose.Types.ObjectId, ref : "file"}, // file model reference here from file model
  category : {type : mongoose.Types.ObjectId, ref : "category",required : true}, // category model reference here from category model
  updatedBy : {type : mongoose.Types.ObjectId, ref : "user",require : true} // user model reference here from user model
},
{timestamps : true}
);

const Post = mongoose.model("post",postSchema);

module.exports = Post;
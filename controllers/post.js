const {File, Category,Post} = require("../models");

const addPost = async (req,res,next) =>{
  try{
    const {title,desc,file,category} = req.body;
    const {_id} = req.user;

    if(file){
      const isFileExist = await File.findById(file);
      if(!file){
        res.code = 404;
        throw new Error("File not found");
      }
    }

    const isCategoryExist = await Category.findById(category);
    if(!category){
      res.code = 404;
      throw new Error("Category not found");
    }

    const newPost = new Post({title,desc,file,category,updatedBy : _id});

    //saving new post
    await newPost.save();
    res.status(201).json({code : 201,statu: true,message : "Post added successfully."})
  }catch(error){
    next(error);
  }
}

const updatePost = async (req,res,next) =>{
  try{
    const {title,desc,file,category} = req.body;
    const {id} = req.params;
    const {_id} = req.user;
    if(file){
      const isFileExist = await File.findById(file);
      if(!file){
        res.code = 404;
        throw new Error("File not found");
      }

      if(category){
        const isCategoryExist = await Category.findById(category);
        if(!isCategoryExist){
          res.code = 404;
          throw new Error("Category not found");
        } 
      }

      const post = await Post.findById(id);
      if(!post){
        res.code = 404;
        throw new Error("Post not found");
      }

      post.title =  title ? title : post.title; // title is required 
      post.desc = desc;
      post.file = file;
      post.category = category ? category : post.category; // category is required 
      post.updatedBy = _id;

      //updating post info in db
      await post.save();

      res.status(200).json({code: 200,status : true,message : "Post updated successfully.",data : {post}})
    }
  }catch(error){
    next(error);
  }
}

const deletePost = async (req,res,next) =>{
  try{
    const {id} = req.params;
    const post = await Post.findById(id);
    if(!post){
      res.code = 404;
      throw new Error("Post not found");
    }

    //deleting post here
    await Post.findByIdAndDelete(id);

    res.status(200).json({code : 200,status:true,message : "Post Deleted Successfully."})
  }catch(error){
    next(error);
  }
}

const getPosts = async(req,res,next) =>{
  try{
    const {page,size, q, category} = req.query;

    const pageNumber = parseInt(page) || 1;
    const sizeNumber = parseInt(size) || 10;
    let query = {};

    if(q){
      const search = new RegExp(q, "i");

      query = {
        $or:[{title: search}]
      }
    }

    if(category){
      query = {...query,category} // ...query is default or we can say it is req.query
    }

    const total = await Post.countDocuments(query);
    const pages = Math.ceil(total/ sizeNumber);

    const posts = await Post.find(query)
    .populate("file")
    .populate("category")
    .populate("updatedBy","-password -verficationCode -forgotPasswordCode")
    .sort({updatedBy : -1})
    .skip((pageNumber -1) * sizeNumber)
    .limit(sizeNumber);

    res.status(200).json({code : 200,status: true,message : "Get posts successfully.",data : {posts,total,pages}});
  }catch(error){
    next(error);
  }
}

const getPost = async(req,res,next) =>{
  try{
    const {id} = req.params;

    // populate will show data of file and category and updated by related with the searched post in more detail
    const post = await Post.findById(id)
    .populate("file")
    .populate("category")
    .populate("updatedBy","-password -verficationCode -forgotPasswordCode"); // here i dont want to show password field in updated by details so i removed it 
    if(!post){
      res.code = 404;
      throw new Error("Post not found");
    }
    
    res.status(200).json({code : 200,status : true,message : "Get Post successfully.",data: {post}})
  }catch(error){
    next(error);
  }
}
module.exports = {addPost,updatePost,deletePost,getPosts,getPost};
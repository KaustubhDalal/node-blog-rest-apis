const { Category,User } = require("../models");

const addCategory = async(req,res,next) =>{
  try{
    const {title,desc} = req.body;
    const {_id} = req.user;

    const isCategoryExist = await Category.findOne({title});
    if(isCategoryExist){
      res.code = 400;
      throw new Error("Category already exist");
    }
    const user = await User.findById({_id});
    if(!user){
      res.code = 405;
      throw new Error("User not found");
    }
    //creating and saving new category in the db.
    const newCategory = new Category({title,desc,updatedBy : _id});
    await newCategory.save();

    res.status(200).json({code : 200,status : true,message : "Category Added Successfully."})
  }catch(error){
    next(error);
  }
}

const updateCategory = async(req,res,next) =>{
  try{
    const {id} = req.params;
    const {_id} = req.user;
    const {title,desc} = req.body;
    //checking is category present in db or not
    const category = await Category.findById(id);
    if(!category){
      res.code = 404;
      throw new Error("Category not found");
    }
    //checking is category with same title exist in db or not
    const isCategoryExist = await Category.findOne({title});
    if(isCategoryExist && isCategoryExist.title == title && String(isCategoryExist._id) !== String(category._id)){
      res.code = 400;
      throw new Error("Title already exist");
    }
    //updating category title and desc
    category.title = title ? title : category.title;
    category.desc = desc;
    category.updatedBy = _id;
    //saving updated category data in db 
    await category.save();
    // returning success response with updated category data
    res.status(200).json({code : 200,status : true,message: "Category updated successfully.",data : {category}});
  }catch(error){
    next(error);
  }
}

const deleteCategory = async(req,res,next) =>{
  try{
    const {id} = req.params;
    const category = await Category.findById(id);

    if(!category){
      res.code = 404;
      throw new Error("Category not found");
    }
    //deleting category by id 
    await Category.findByIdAndDelete(id);
    res.status(200).json({code : 200,status : true,message: "Category deleted successfully."})
  }catch(error){
    next(error);
  }
}

const getCategories = async(req,res,next) => {
  try{
    const {q,size,page} = req.query;
    let query = {};

    const sizeNumber = parseInt(size) || 10 // if size provided then take that size o.w by default it is 10
    const pageNumber = parseInt(page) || 1 // if page provided then take that page o.w by default it is 1
    
    if(q){
      // here with regexp getting all categories which match title or desc
      const search = RegExp(q,"i"); // i means incasesesitive
      query = { $or : [{title: search},{desc : search}]} // here we are searching with eighter title or desc in db
    }
    //counting no of entries in document
    const total = await Category.countDocuments(query);
    const pages=  Math.ceil(total / sizeNumber);  // rounding off number here
    
    const categories = await Category.find(query).skip((pageNumber - 1) * sizeNumber ).limit(sizeNumber).sort({updatedBy : -1}); 
    // skip(10) will skip first 10 documents
    // (pageNumber - 1) * sizeNumber means for example : pageNumber = 5 and sizeNumber = 20 then (5-1) * 20 = 80
    // limit(10) it will only return 10 documents
    // sort({updatedBy : -1}) means sorting by updatedBy column and -1 means in descending order
    res.status(200).json({code : 200, status : true, message: "Get category list successfully.",data :{categories,total,pages}});
  }catch(error){
    next(error)
  }
}

const getCategory = async(req,res,next) =>{
  try{
    const {id} = req.params;
    //searching category by id in db
    const category = await Category.findById(id);
    if(!category){
      res.code = 404;
      throw new Error("Category not found.");
    }
    res.status(200).json({code : 200,status : true,message: "Get Category Successfully.",data:{category}})
  }catch(error){
    next(error);
  }
}

module.exports = {addCategory,updateCategory,deleteCategory,getCategories,getCategory}
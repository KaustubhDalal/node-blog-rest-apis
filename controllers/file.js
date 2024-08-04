const path = require("path");
const {validateExtension} = require("../validators/file")
const {uploadFileToS3,signedUrl,deleteFileFromS3} = require("../utils/awsS3");
const {File} = require("../models");

const uplaodFile = async (req,res,next) =>{
  try{
    const {file} = req;
    if(!file){
      res.code = 400;
      throw new Error("File is not selected.");
    }
    const ext = path.extname(file.originalname);
    const isValidExt = validateExtension(ext);
    if(!isValidExt){
      res.code = 400;
      throw new Error("Only .jpg or .jpeg or .png format is allowed.")
    }

    //uplaoding file to S3 bucket here
    const key = await uploadFileToS3({file,ext});
    
    if(key){
      const newFile = new File({
        key : key,
        size : file.size,
        mimetype : file.mimetype,
        createdBy : req.user._id
      });
      //saving file in db as well
      await newFile.save();
    }
    res.status(200).json({code : 200, status : true,message : "File uplaoded successfully.",data: {key}})
  }catch(error){
    next(error);   
  }
}

const getSignedUrl = async (req,res,next) =>{
  try{
    const {key} = req.query;
    const url = await signedUrl(key);
    res.status(200).json({code : 200,status : true,message : "Get signed url sucessfully.",data : {url}})
  }catch(error){
    next(error)
  }
}

const deleteFile = async (req,res,next) => {
  try{
    const {key} = req.query;

    await deleteFileFromS3(key); // It will delete file from s3 of provided key
    await File.findOneAndDelete({key}); // deleting file from db as well
    
    res.status(200).json({code : 200,status : true,message : "File delete successfully."});
  }catch(error){
    next(error);
  }
}

module.exports = {uplaodFile,getSignedUrl,deleteFile}
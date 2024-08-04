//it is backup file of upload.js in middleware 
//below code is used to uplaod file in diskstorage(local project folder)
//later on we updated it to store on s3 bucket
const multer = require("multer");
const path = require("path");
const generateCode = require("../utils/generateCode");

const storage = multer.diskStorage({
  destination: (req,file,callback) =>{ //specify destination location where need to store uplaoded files  
    callback(null,"./uploads")
  },
  filename: (req,file,callback) =>{
    // console.log(file)
    const originalName = file.originalname;
    const extension = path.extname(originalName);
    const filename = originalName.replace(extension,"");
    const compressedFilename = filename.split(" ").join("_");
    const lowercaseFilename = compressedFilename.toLocaleLowerCase();
    const code = generateCode(12);
    const finalFile = `${lowercaseFilename}_${code}${extension}`;
    callback(null,finalFile);
  },
})

const upload = multer({
  storage: storage,
  fileFilter : (req,file,callback) =>{
    // console.log(file);
    const mimetype = file.mimetype;
    if(mimetype === "image/jpg" || mimetype === "image/jpeg" || mimetype === "image/png" || mimetype === 'application/pdf'){
      //if uploaded file is of type these then allow
      callback(null,true);
    }else{
      callback(new Error("Only .jpg or .jpeg or .png or .pdf extension files are allowed"))
    }
  }
});

module.exports = upload;
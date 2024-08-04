const express = require("express");
const router = express.Router();
const isAuth = require('../middlewares/isAuth');
const {fileController} = require('../controllers');
const upload = require('../middlewares/upload');

// here we are upload max 3 files
// router.post("/upload",isAuth,upload.array("image",3),fileController.uplaodFile); //can upload max 3 files at a time 

//upload.single("image") use to only uplaod one file
router.post("/upload",isAuth,upload.single("image"),fileController.uplaodFile);
router.get("/signed-url",isAuth,fileController.getSignedUrl)
router.delete("/delete-file",isAuth,fileController.deleteFile);

module.exports = router;


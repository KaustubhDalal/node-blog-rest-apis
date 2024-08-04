const multer = require("multer");

const upload = multer({
  storage : multer.memoryStorage(),
  limit : {fileSize : 1024 * 1024 * 50} //it takes file size in bytes so we pass here max 50 mb file size on uplaod
});

module.exports = upload;
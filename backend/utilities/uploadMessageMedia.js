const multer = require('multer')
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/media/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) 
  }
})

exports.uploadMedia = multer({
  storage: storage,
  limits:{
    fileSize: 10 * 1024 * 1024
  }
});
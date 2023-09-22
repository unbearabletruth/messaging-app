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
  fileFilter: function (req, file, callback) {
    const ext = path.extname(file.originalname);
    console.log(ext)
    if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' &&
    ext !== '.mp4' && ext !== '.mov') {
        return callback(new Error('Only images and videos are allowed'))
    }
    callback(null, true)
  },
  limits:{
    fileSize: 10 * 1024 * 1024
  }
});
const multer = require('multer')
const path = require('path');
const fs = require('fs')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './public/profiles'
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) 
  }
})

exports.upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
        return callback(new Error('Only images are allowed'))
    }
    callback(null, true)
  },
  limits:{
    fileSize: 1024
  }
}); 

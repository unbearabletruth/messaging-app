const multer = require('multer')
const fs = require('fs')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './public/media'
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
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
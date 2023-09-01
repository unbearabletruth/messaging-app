const multer = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/profiles/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname) 
  }
})

const filter = (req, file, cb) => {
  const image = req.file;
  const extensions = ['png', 'jpeg', 'jpg', 'gif'];
  const fileTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
  const maxSize = 2;

  const file_extension = image.originalname.slice(
      ((image.originalname.lastIndexOf('.') - 1) >>> 0) + 2
  );

  if (!extensions.includes(file_extension) || !fileTypes.includes(image.mimetype)) {
      return 'File must be an image';
  }

  if ((image.size / (1024 * 1024)) > maxSize) {                  
     return 'File too large';
  }
}

exports.upload = multer({
  storage: storage, 
}); 

const express = require('express');
const { loginUser, signupUser, getUsers, getUser, searchUsers, updateUser } = require('../controllers/user_controller');
const router = express.Router();
const { upload } = require('../utilities/uploadImage')


router.post('/login', loginUser)

router.post('/signup', signupUser)

router.get("/", getUsers);

router.get('/search', searchUsers)

router.get("/:id", getUser);

router.patch('/:id', upload.single('profilePic'), updateUser)


module.exports = router;
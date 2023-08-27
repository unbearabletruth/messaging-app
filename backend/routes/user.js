const express = require('express');
const { loginUser, signupUser, getUsers, getUser, searchUsers } = require('../controllers/user_controller');
const router = express.Router();

router.post('/login', loginUser)

router.post('/signup', signupUser)

router.get("/", getUsers);

router.get('/search', searchUsers)

router.get("/:id", getUser);



module.exports = router;
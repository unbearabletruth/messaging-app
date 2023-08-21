const express = require('express');
const { loginUser, signupUser, getUsers } = require('../controllers/user_controller');
const router = express.Router();

router.post('/login', loginUser)

router.post('/signup', signupUser)

router.get("/", getUsers);

module.exports = router;
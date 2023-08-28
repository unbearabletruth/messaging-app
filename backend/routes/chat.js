const express = require('express');
const router = express.Router();
const messageRouter = require('./message');
const { getChat, getChats, createChat, updateChat, deleteChat, searchChats } = require('../controllers/chat_controller');


router.get("/users/:id", getChats);

router.get("/search", searchChats);

router.get("/:id", getChat);

router.post("/", createChat);

router.patch("/:id", updateChat);

router.delete("/:id", deleteChat);

router.use('/:id', messageRouter);


module.exports = router;
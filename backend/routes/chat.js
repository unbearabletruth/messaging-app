const express = require('express');
const router = express.Router();
const messageRouter = require('./message');
const { 
  getChat, getChats, createChat, updateLatestMessage, deleteChat, 
  searchChats, addToChat, removeFromChat, updateUserTimestamp,
  addRequest, removeRequest, deleteFor, addFor 
} = require('../controllers/chat_controller');


router.get("/users/:id", getChats);

router.get("/search", searchChats);

router.get("/:id", getChat);

router.post("/", createChat);

router.patch("/:id", updateLatestMessage);

router.patch("/:id/add", addToChat);

router.patch("/:id/remove", removeFromChat);

router.patch("/:id/timestamp", updateUserTimestamp);

router.patch("/:id/addRequest", addRequest)

router.patch("/:id/removeRequest", removeRequest)

router.patch("/:id/deleteFor", deleteFor)

router.patch("/:id/addFor", addFor)

router.delete("/:id", deleteChat);

router.use('/:id', messageRouter);


module.exports = router;
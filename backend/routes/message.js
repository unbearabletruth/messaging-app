const express = require('express');
const router = express.Router({ mergeParams: true });
const { getMessages, createMessage, deleteMessage, updateMessage } = require('../controllers/message_controller');

router.get("/messages", getMessages);

router.post("/messages", createMessage);

router.delete("/messages/:messageId", deleteMessage);

router.patch("/messages/:messageId", updateMessage);

module.exports = router;
const express = require('express');
const router = express.Router({ mergeParams: true });
const { getMessages, createMessage, deleteMessage, updateMessage } = require('../controllers/message_controller');
const { uploadMedia } = require('../utilities/uploadMessageMedia')

router.get("/messages", getMessages);

router.post("/messages", uploadMedia.single('media'), createMessage);

router.delete("/messages/:messageId", deleteMessage);

router.patch("/messages/:messageId", updateMessage);

module.exports = router;
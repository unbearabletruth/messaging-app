const express = require('express');
const router = express.Router();
const messageRouter = require('./message');

router.get("/", getChats);

router.get("/:id", getChat);

router.post("/", createChat);

router.patch("/:id", updateChat);

router.delete("/:id", deleteChat);

router.use('/:id', messageRouter)

module.exports = router;
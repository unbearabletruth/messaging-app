const express = require('express');
const router = express.Router({ mergeParams: true });


router.get("/messages", getMessages);

router.post("/messages", createMessage);

router.delete("/messages/:messageId", deleteMessage);

router.patch("/messages/:messageId", updateMessage);

module.exports = router;
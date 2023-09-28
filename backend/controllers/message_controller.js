const Message = require("../models/message");

exports.getMessages = async (req, res) => {
    const messages = await Message.find({chat: req.params.id})
        .populate('author', 'username')
        .skip(req.query.skip)
        .limit(req.query.mes)
        .sort({createdAt: -1})
        .exec()

    res.status(200).json(messages)
};

exports.createMessage = async (req, res) => {
    let newMessage, url;
    if (req.file) {
        url = `${req.protocol}://${req.get('host')}/media/${req.file.filename}`
        newMessage = new Message({
            text: req.body.text,
            author: req.body.author,
            chat: req.body.chat,
            media: {
                url: url,
                name: req.file.filename,
                size: req.file.size
            }
        })
    } else {
        newMessage = new Message({
            text: req.body.text,
            author: req.body.author,
            chat: req.body.chat,
        })
    }
    try{
        const message = await newMessage.save()
        await message.populate('chat')
        await message.populate('author', 'username');
        res.status(200).json(message)
    } catch (error){
        res.status(400).json({error: error.message})
    }
}

exports.deleteMessage = async (req, res) => {
    const message = await Message.findByIdAndDelete(req.params.messageId)
    if (message){
        return res.status(200).json(message)
    }
    res.status(400).json({error: 'No such message'})
}

exports.updateMessage = async (req, res) => {
    const message = await Message.findByIdAndUpdate(req.params.messageId, {
        ...req.body,
    })
    if (message){
        return res.status(200).json(message)
    }
    res.status(400).json({error: 'No such comment'})
}
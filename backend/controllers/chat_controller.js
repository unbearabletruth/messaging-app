const Chat = require("../models/chat");

exports.getChats = async (req, res) => {
    const chats = await Chat.find({users: { $in: [req.params.id] }}).populate('latestMessage').populate('users', 'username profilePic').sort({updatedAt: -1}).exec()
    res.status(200).json(chats)
};

exports.getChat = async (req, res) => {
    const chat = await Chat.findById(req.params.id).populate('users', 'username profilePic').exec()
    if (chat){
        return res.status(200).json(chat)
    }
    res.status(400).json({error: 'No such chat'})
};

exports.createChat = async (req, res) => {
    const newChat = new Chat({
        name: req.body.name,
        isGroupChat: req.body.isGroupChat,
        users: req.body.users,
        latestMessage: null
    })
    try{
        const chat = await newChat.save()
        res.status(200).json(chat)
    } catch (error){
        res.status(400).json({error: error.message})
    }
}

exports.updateChat = async (req, res) => {
    const chat = await Chat.findByIdAndUpdate(req.params.id, {
        ...req.body
    })
    if (chat){
        return res.status(200).json(chat)
    }
    res.status(400).json({error: 'No such chat'})
}

exports.deleteChat = async (req, res) => {
    const chat = await Chat.findByIdAndDelete(req.params.id)
    if (chat){
        return res.status(200).json(chat)
    }
    res.status(400).json({error: 'No such chat'})
}
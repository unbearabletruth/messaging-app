const Chat = require("../models/chat");

exports.getChats = async (req, res) => {
    const chats = await Chat.find({users: { $in: [req.params.id] }})
        .populate('latestMessage')
        .populate('users', 'username profilePic bio lastSeen')
        .populate('requests', 'username profilePic lastSeen')
        .sort({latestMessage: -1}).exec()
    res.status(200).json(chats)
};

exports.getChat = async (req, res) => {
    const chat = await Chat.findById(req.params.id).populate('users', 'username profilePic bio lastSeen').exec()
    if (chat){
        return res.status(200).json(chat)
    }
    res.status(400).json({error: 'No such chat'})
};

exports.createChat = async (req, res) => {
    const lastSeenInChat = [];
    for (let user of req.body.users) {
        let obj = {userId: user, timestamp: Date.now()}
        lastSeenInChat.push(obj)
    }

    const newChat = new Chat({
        name: req.body.name,
        isGroupChat: req.body.isGroupChat,
        privateGroup: req.body.privateGroup,
        admins: req.body.users,
        users: req.body.users,
        latestMessage: null,
        lastSeenInChat: lastSeenInChat
    })
    try{
        const chat = await newChat.save()
        await chat.populate('users', 'username profilePic')
        res.status(200).json(chat)
    } catch (error){
        res.status(400).json({error: error.message})
    }
}

exports.updateLatestMessage = async (req, res) => {
    const chat = await Chat.findByIdAndUpdate(req.params.id, {
        ...req.body,
    }, { new: true }
    ).populate('latestMessage').populate('users', 'username profilePic')
    
    if (chat){
        return res.status(200).json(chat)
    }
    res.status(400).json({error: 'No such chat'})
}

exports.addToChat = async (req, res) => {
    const lastSeenInChat = {userId: req.body.user, timestamp: Date.now()}

    const chat = await Chat.findByIdAndUpdate(req.params.id, { 
        $push: { users: req.body.user, lastSeenInChat: lastSeenInChat }
    }, { new: true }
    ).populate('latestMessage').populate('users', 'username profilePic')

    if (chat){
        return res.status(200).json(chat)
    }
    res.status(400).json({error: 'No such chat'})
}

exports.removeFromChat = async (req, res) => {
    const chat = await Chat.findByIdAndUpdate(req.params.id, { 
        $pull: { users: req.body.user, lastSeenInChat: {userId: req.body.user} }
    }, { new: true }
    ).populate('latestMessage').populate('users', 'username profilePic')

    if (chat) {
        return res.status(200).json(chat)
    }
    res.status(400).json({error: 'No such chat'})
}

exports.updateUserTimestamp = async (req, res) => {
    const lastSeenInChat = {userId: req.body.user, timestamp: Date.now()}

    const chat = await Chat.findOneAndUpdate(
        { _id: req.params.id, 'lastSeenInChat.userId': lastSeenInChat.userId },
        { $set: { 'lastSeenInChat.$.timestamp': lastSeenInChat.timestamp } },
        { new: true }
    ).populate('latestMessage').populate('users', 'username profilePic lastSeen')

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

exports.searchChats = async (req, res) => {
    if (req.query.search) {
        const keyword = {name: {$regex: req.query.search, $options: 'i'}}
        const chats = await Chat.find(keyword)
            .populate('latestMessage')
            .populate('users', 'username profilePic bio lastSeen')
            .exec()
        res.status(200).json(chats)
    }
};

exports.addRequest = async (req, res) => {
    const chat = await Chat.findByIdAndUpdate(req.params.id, { 
        $push: { requests: req.body.request }
    }, { new: true }
    ).populate('latestMessage')
    .populate('users', 'username profilePic')
    .populate('requests', 'username profilePic lastSeen')

    if (chat){
        return res.status(200).json(chat)
    }
    res.status(400).json({error: 'No such chat'})
}

exports.removeRequest = async (req, res) => {
    const chat = await Chat.findByIdAndUpdate(req.params.id, { 
        $pull: { requests: req.body.request }
    }, { new: true }
    ).populate('latestMessage')
    .populate('users', 'username profilePic')
    .populate('requests', 'username profilePic lastSeen')

    if (chat){
        return res.status(200).json(chat)
    }
    res.status(400).json({error: 'No such chat'})
}
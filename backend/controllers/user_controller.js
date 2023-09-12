const User = require("../models/user");
const jwt = require("jsonwebtoken")

const createToken = (_id) => {
    return jwt.sign({_id}, process.env.SECRET, {expiresIn: '5d'})
}

exports.loginUser = async (req, res) => {
    const {username, password} = req.body
    try {
        const user = await User.login(username, password)
        const token = createToken(user._id)
        const _id = user._id
        res.status(200).json({_id, username, token})
    } catch(error) {
        res.status(400).json({error: error.message})
    }
}

exports.signupUser = async (req, res) => {
    const {username, password} = req.body
    try {
        const user = await User.signup(username, password)
        const token = createToken(user._id)
        const _id = user._id
        res.status(200).json({_id, username, token})
    } catch(error) {
        res.status(400).json({error: error.message})
    }
}

exports.getUsers = async (req, res) => {
  const users = await User.find().exec()
  res.status(200).json(users)
};

exports.getUser = async (req, res) => {
	const user = await User.findById(req.params.id, 'username profilePic bio').exec()
	res.status(200).json(user)
};

exports.searchUsers = async (req, res) => {
	if (req.query.search) {
		const keyword = {username: {$regex: req.query.search, $options: 'i'}}
		const users = await User.find(keyword).exec()
		res.status(200).json(users)
	}
};

exports.updateUser = async (req, res) => {
    let url, user;
    if (req.file){
        url = `${req.protocol}://${req.get('host')}/profiles/${req.file.filename}`
        user = await User.findByIdAndUpdate(req.params.id, {
            profilePic: url
        }, { new: true })
    }
    if (req.body.username) {
        user = await User.findByIdAndUpdate(req.params.id, {
            username: req.body.username,
        }, { new: true })
    }
    if (req.body.bio) {
        user = await User.findByIdAndUpdate(req.params.id, {
            bio: req.body.bio,
        }, { new: true })
    }

    if (user){
        return res.status(200).json(user)
    }
    res.status(400).json({error: 'No such chat'})
}
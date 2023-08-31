const User = require("../models/user");
const jwt = require("jsonwebtoken")

const createToken = (_id) => {
    return jwt.sign({_id}, process.env.SECRET, {expiresIn: '5d'})
}

exports.loginUser = async (req, res) => {
    const {username, password} = req.body
    try {
        const user = await User.login(username, password)
        console.log(user)
        const token = createToken(user._id)
        const id = user._id
        const profilePic = user.profilePic
        res.status(200).json({id, username, token, profilePic})
    } catch(error) {
        res.status(400).json({error: error.message})
    }
}

exports.signupUser = async (req, res) => {
    const {username, password} = req.body
    try {
        const user = await User.signup(username, password)
        const token = createToken(user._id)
        const id = user._id
        const profilePic = user.profilePic
        res.status(200).json({id, username, token, profilePic})
    } catch(error) {
        res.status(400).json({error: error.message})
    }
}

exports.getUsers = async (req, res) => {
  const users = await User.find().exec()
  res.status(200).json(users)
};

exports.getUser = async (req, res) => {
	const users = await User.findById(req.params.userId).exec()
	res.status(200).json(users)
};

exports.searchUsers = async (req, res) => {
	if (req.query.search) {
		const keyword = {username: {$regex: req.query.search, $options: 'i'}}
		const users = await User.find(keyword).exec()
		res.status(200).json(users)
	}
};
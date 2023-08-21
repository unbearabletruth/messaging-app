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
        res.status(200).json({username, token})
    } catch(error) {
        res.status(400).json({error: error.message})
    }
}

exports.signupUser = async (req, res) => {
    const {username, password} = req.body
    try {
        const user = await User.signup(username, password)
        const token = createToken(user._id)
        res.status(200).json({username, token})
    } catch(error) {
        res.status(400).json({error: error.message})
    }
}

exports.getUsers = async (req, res) => {
  const users = await User.find().exec()
  res.status(200).json(users)
};
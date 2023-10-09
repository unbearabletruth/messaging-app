const User = require("../models/user");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");

const createToken = (_id) => {
    return jwt.sign({_id}, process.env.SECRET, {expiresIn: '5d'})
}

exports.loginUser = [
    body("username")
        .trim()
        .escape()
        .custom(async value => {
            const user = await User.findOne({ username: value });
            if (!user) {
                throw new Error('No such username');
            }
        }),
    body("password")
        .trim()
        .escape()
        .custom(async (value, {req}) => {
            const user = await User.findOne({ username: req.body.username }).select('password');
            if (user) {
                const match = await bcrypt.compare(value, user.password);
                if (!match) {
                    throw Error('Wrong password')
                }
            }
        }),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }
        const {username} = req.body

        const user = await User.findOne({username})
        const token = createToken(user._id)
        const _id = user._id
        res.status(200).json({_id, username, token})
    }
]

exports.signupUser = [
    body("username")
        .trim()
        .isLength({ min: 3 })
        .withMessage('Username min length is 3 characters')
        .isLength({ max: 15})
        .withMessage('Username max length is 15 characters')
        .escape()
        .custom(async value => {
            const exists = await User.findOne({ username: value });
            if (exists) {
                throw new Error('Username already in use');
            }
        }),
    body("password", "Password must contain at least 5 characters")
        .trim()
        .isLength({ min: 5 })
        .escape(),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }
        const {username, password} = req.body

        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)
        const user = await User.create({username, password: hash})
        
        const token = createToken(user._id)
        const _id = user._id
        res.status(200).json({_id, username, token})
    }
]

exports.getUsers = async (req, res) => {
  const users = await User.find().sort({lastSeen: -1}).limit(10).exec()
  res.status(200).json(users)
};

exports.getUser = async (req, res) => {
	const user = await User.findById(req.params.id).exec()
	res.status(200).json(user)
};

exports.getBot = async (req, res) => {
    const bot = await User.findOne({username: req.params.name}).exec()
    if (bot) {
        return res.status(200).json(bot)
    }
    return res.status(400).json({error: 'No such bot'})
}

exports.searchUsers = async (req, res) => {
	if (req.query.search) {
		const keyword = {username: {$regex: req.query.search, $options: 'i'}}
		const users = await User.find(keyword).sort({lastSeen: -1}).limit(10).exec()
		res.status(200).json(users)
	}
};

exports.updateUser = [
    body("username")
        .trim()
        .isLength({ min: 3 })
        .withMessage('Username min length is 3 characters')
        .isLength({ max: 15})
        .withMessage('Username max length is 15 characters')
        .escape()
        .custom(async value => {
            const exists = await User.findOne({ username: value });
            if (exists) {
                throw new Error('Username already in use');
            }
        })
        .optional(),
    body("bio", "Bio shouldn't exceed 50 characters")
        .trim()
        .isLength({ max: 50 })
        .optional(),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }
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

        return res.status(200).json(user)
    }
]
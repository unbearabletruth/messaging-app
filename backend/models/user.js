const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  profilePic: { 
    type: String,
    required: true,
    default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
  },
  bio: { type: String }
});

UserSchema.statics.signup = async function (username, password) {
    if (!username || !password){
        throw Error ('All field must be filled')
    }
    const exists = await this.findOne({username})
    if(exists){
        throw Error('username already in use')
    }
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
    const user = await this.create({username, password: hash})
    return user
}

UserSchema.statics.login = async function (username, password) {
    if (!username || !password){
        throw Error ('All field must be filled')
    }
    const user = await this.findOne({username})
    if(!user){
        throw Error('incorrect username')
    }
    const match = await bcrypt.compare(password, user.password)
    if (!match){
        throw Error('incorrect password')
    }
    return user
}

module.exports = mongoose.model("User", UserSchema);
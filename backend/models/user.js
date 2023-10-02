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
  bio: { type: String },
  lastSeen: { type: Date }
});

module.exports = mongoose.model("User", UserSchema);
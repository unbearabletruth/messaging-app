const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ChatSchema = new Schema({
  name: { type: String },
  isGroupChat: { type: Boolean, required: true },
  privateGroup: { type: Boolean, required: true, default: false },
  users: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  admins: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  requests: [{ type: Schema.Types.ObjectId, ref: "User" }],
  latestMessage: { type: Schema.Types.ObjectId, ref: "Message" },
  lastSeenInChat: [{ userId: String, timestamp: Date}],
  groupPic: { 
    type: String,
    required: true,
    default: "https://icon-library.com/images/group-of-people-icon-png/group-of-people-icon-png-13.jpg",
  },
  }, 
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Chat", ChatSchema);
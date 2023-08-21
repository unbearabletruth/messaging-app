const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ChatSchema = new Schema({
  name: { type: String },
  isGroupChat: { type: Boolean, required: true },
  users: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  latestMessage: { type: Schema.Types.ObjectId, ref: "Message", required: true }
  }, 
);

module.exports = mongoose.model("Chat", ChatSchema);
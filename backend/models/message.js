const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  text: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true }, 
  chat: { type: Schema.Types.ObjectId, ref: "Chat", required: true }, 
  }, 
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Message", MessageSchema);
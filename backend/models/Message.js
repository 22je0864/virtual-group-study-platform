const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudyGroup",
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    text: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ["text", "file"],
      default: "text"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
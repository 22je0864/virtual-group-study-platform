const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudyGroup",
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    fileType: {
      type: String
    },
    filePath: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("File", fileSchema);

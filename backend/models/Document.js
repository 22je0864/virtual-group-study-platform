const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "StudyGroup", required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    originalName: { type: String, required: true },
    filename: { type: String, required: true }, // stored name in /uploads
    mimeType: { type: String, required: true },
    size: { type: Number, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);

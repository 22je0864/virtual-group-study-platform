const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/authMiddleware");
const File = require("../models/File");
const StudyGroup = require("../models/StudyGroup");
const Document = require("../models/Document");
const { extractPdfText } = require("../utils/pdfText");
const { summarizeText } = require("../utils/summarizer");



// Upload file
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      console.log("Uploaded file:", req.file);
      console.log("GroupId:", req.body.groupId);

      const { groupId } = req.body;

      const group = await StudyGroup.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      if (!group.members.includes(req.user.id)) {
        return res.status(403).json({ message: "Not a group member" });
      }

      const file = await File.create({
        groupId,
        uploadedBy: req.user.id,
        originalName: req.file.originalname,
        fileName: req.file.filename,
        fileType: req.file.mimetype,
        filePath: req.file.path
      });

      // res.status(201).json(file);
      res.status(201).json({
        filename: req.file.filename,  // ← Use Multer property directly
        originalName: req.file.originalname,
        fileType: req.file.mimetype
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ✅ Summarize a PDF file by fileId
router.get("/summary/:fileId", authMiddleware, async (req, res) => {
  try {
    const fileId = req.params.fileId;

    const file = await File.findById(fileId);
    if (!file) return res.status(404).json({ message: "File not found" });

    // Group membership check
    const group = await StudyGroup.findById(file.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({ message: "Not a group member" });
    }

    // Only PDF supported (for now)
    if (!file.fileType || !file.fileType.includes("pdf")) {
      return res.status(400).json({ message: "Only PDF summarization supported right now." });
    }

    let text = "";
      try {
        text = await extractPdfText(file.filePath);
      } catch (e) {
        if (String(e.message).startsWith("FILE_NOT_FOUND:")) {
          return res.status(404).json({
          message: "This file was deleted from uploads folder. Please re-upload it."
        });
      }
      throw e;
    }
 
    if (!text || text.length < 80) {
      return res.json({ summary: "Not enough text found in this PDF to summarize." });
    }

    const summary = summarizeText(text, 7);

    res.json({
      fileId,
      originalName: file.originalName,
      summary
    });
  } catch (err) {
    console.error("PDF summary error:", err);
    // nicer error if file missing
    if (String(err.message || "").startsWith("FILE_NOT_FOUND:")) {
      return res.status(404).json({
        message: "File missing on server (maybe deleted). Please re-upload and try again."
      });
    }
    res.status(500).json({ message: "Failed to summarize document" });
  }
});


// Get files for a group
router.get("/:groupId", authMiddleware, async (req, res) => {
  try {
    const files = await File.find({ groupId: req.params.groupId })
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(files);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;

const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

const authMiddleware = require("../middleware/authMiddleware");
const StudyGroup = require("../models/StudyGroup");
const Document = require("../models/Document");

//const pdfParse = require("pdf-parse");
const { summarizeText } = require("../utils/summarizer");

// GET /api/documents/:docId/summary
router.get("/:docId/summary", authMiddleware, async (req, res) => {
  try {
    const { docId } = req.params;

    const doc = await Document.findById(docId);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    // membership check
    const group = await StudyGroup.findById(doc.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({ message: "Not a group member" });
    }

    // Only support PDFs for now (deadline-safe)
    if (doc.mimeType !== "application/pdf") {
      return res.status(400).json({ message: "Only PDF summary is supported right now." });
    }

    const filePath = path.join(__dirname, "..", "uploads", doc.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Uploaded file missing on server" });
    }

    const dataBuffer = fs.readFileSync(filePath);
    const parsed = await pdfParse(dataBuffer);

    const text = (parsed.text || "").trim();
    if (!text) {
      return res.json({ summary: "No readable text found in this PDF." });
    }

    const summary = summarizeText(text, 7);

    res.json({
      docId: doc._id,
      originalName: doc.originalName,
      summary
    });
  } catch (err) {
    console.error("Document summary error:", err);
    res.status(500).json({ message: "Failed to summarize document" });
  }
});

module.exports = router;

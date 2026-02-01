const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Message = require("../models/Message");
const StudyGroup = require("../models/StudyGroup");
const Summary = require("../models/Summary");
// const summarizeText = require("../utils/claude");
const { summarizeText } = require("../utils/summarizer");


router.get("/:groupId", authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await StudyGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({ message: "Not a group member" });
    }

    const messages = await Message.find({ groupId }).sort({ createdAt: 1 });

    if (messages.length === 0) {
      return res.json({ summary: "No messages to summarize." });
    }

    const combinedText = messages
      .map(m => m.text)
      .join(" ");

    const summaryText = await summarizeText(combinedText, 6);

    // ✅ SAVE SUMMARY
    const summary = await Summary.create({
      groupId,
      generatedBy: req.user.id,
      content: summaryText
    });

    res.json({
      message: "Summary generated and saved",
      summary: summary.content
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
     
module.exports = router;


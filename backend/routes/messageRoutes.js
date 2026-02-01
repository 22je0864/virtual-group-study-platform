const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const StudyGroup = require("../models/StudyGroup");
const authMiddleware = require("../middleware/authMiddleware");

// SEND MESSAGE
router.post("/send", authMiddleware, async (req, res) => {
  try {
    const { groupId, text } = req.body;

    // Check if user is member of group
    const group = await StudyGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({ message: "Not a group member" });
    }

    const message = await Message.create({
      groupId,
      sender: req.user.id,
      text
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET MESSAGES FOR A GROUP
router.get("/:groupId", authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check membership
    const group = await StudyGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({ message: "Not a group member" });
    }

    const messages = await Message.find({ groupId })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const StudyGroup = require("../models/StudyGroup");
const authMiddleware = require("../middleware/authMiddleware");


// CREATE GROUP
router.post("/create", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Only admins can create groups" });
  }

  try {
    const { name, description } = req.body;

    const group = await StudyGroup.create({
      name,
      description,
      createdBy: req.user.id,
      members: [req.user.id]
    });

    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// JOIN GROUP
router.post("/join/:groupId", authMiddleware, async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.members.includes(req.user.id)) {
      return res.status(400).json({ message: "Already a member" });
    }

    group.members.push(req.user.id);
    await group.save();

    res.json({ message: "Joined group successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// GET MY GROUPS
router.get("/my-groups", authMiddleware, async (req, res) => {
  try {
    const groups = await StudyGroup.find({
      members: req.user.id
    }).select("name description createdAt");

    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all groups (for joining)
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const groups = await StudyGroup.find()
      .populate("members", "name email")
      .select("name description members createdAt");
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;

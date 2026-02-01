const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const connectDB = require("./utils/db");
const Message = require("./models/Message");
const StudyGroup = require("./models/StudyGroup");

const app = express();
const server = http.createServer(app); // ← Changed from app.listen

// Socket.io setup
const io = new Server(server, {
  cors: { origin: "*" }
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect database
connectDB();

// Routes (ALL your existing routes preserved)
app.use("/api/test", require("./routes/test"));
app.use("/api/users", require("./routes/user"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/protected", require("./routes/protected"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/groups", require("./routes/groupRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/files", require("./routes/fileRoutes"));
app.use("/uploads", express.static("uploads"));
app.use("/api/summary", require("./routes/summaryRoutes"));
//app.use("/api/documents", require("./routes/documentSummaryRoutes"));


// Socket.io Authentication Middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id || decoded.userId;
    socket.userRole = decoded.role;

    next();
  } catch (error) {
    next(new Error("Authentication error"));
  }
});

// Socket.io Connection Handler
io.on("connection", (socket) => {
  console.log("User connected:", socket.userId);

  // Join a group room
  socket.on("joinGroup", async (groupId) => {
    try {
      const group = await StudyGroup.findById(groupId);

      if (!group) {
        socket.emit("error", { message: "Group not found" });
        return;
      }

      if (!group.members.includes(socket.userId)) {
        socket.emit("error", { message: "Not a group member" });
        return;
      }

      socket.join(groupId);
      console.log(`User ${socket.userId} joined group ${groupId}`);

      socket.emit("joinedGroup", { groupId });
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  // Send message
  socket.on("sendMessage", async (data) => {
    console.log("RAW DATA KEYS:", Object.keys(data));
    console.log("sendMessage received from frontend:", data);
    try {
      const { groupId, text } = data;
      
      console.log("User:", socket.userId, "Group:", groupId);
      const group = await StudyGroup.findById(groupId);
      if (!group || !group.members.includes(socket.userId)) {
        socket.emit("error", { message: "Access denied" });
        return;
      }

      const message = await Message.create({
        groupId,
        sender: socket.userId,
        text
      });

      await message.populate("sender", "name email");

      io.to(groupId).emit("newMessage", message);

      console.log(`Message sent in group ${groupId}`);
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  // Leave group
  socket.on("leaveGroup", (groupId) => {
    socket.leave(groupId);
    console.log(`User ${socket.userId} left group ${groupId}`);
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.userId);
  });
});
                   
// Start server (IMPORTANT: use server.listen, not app.listen)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

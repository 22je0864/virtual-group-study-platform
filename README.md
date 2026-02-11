# Virtual Group Study Platform (Real-Time + AI Summaries)

A full-stack platform where students can create/join virtual study groups, chat in real time, share notes/files, and generate AI-style summaries of conversations and uploaded documents.

> Built for a collaborative learning experience: **groups + chat + files + summaries + roles**.

---

## ✨ Features

### Study Groups
- Admins can create study groups
- Members can join existing groups
- Dashboard shows:
  - **My Study Groups**
  - **Other Available Groups** (Join button)

### Real-Time Group Chat (Socket.IO)
- Live messaging inside each group
- Messages are saved in MongoDB
- Multi-user support (works in two browsers / incognito)

### File Sharing
- Upload PDFs/images/docs inside group chat
- File saved on backend (`/backend/uploads`)
- Group members can download the file

### AI Summarization
- **Chat Summary** button generates a summary of group chat
- **Document Summary** button (PDF-only) extracts text and summarizes
- Uses **fallback summarizer** (extractive / local) so it works without paid APIs

> Claude / OpenAI implemented but due to subscription limit for now I used fallback summary.

### User Roles
- `admin` and `member`
- Admin-only group creation enforced in backend

---

## Tech Stack

**Frontend**
- React (Vite)
- React Router
- Axios
- Socket.io-client

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- JWT Authentication
- Multer (file uploads)
- PDF text extraction (`pdfjs-dist`)

---

## Screenshots

Screenshots are stored in the `screenshots/` folder.

Example:
- Dashboard
- Group Chat UI
- Files modal
- AI Summary modal

---

## Setup & Run Locally

### 1) Clone repo
```bash
git clone <your-repo-url>
cd virtual-group-study-platform

# 📚 StudySphere – Real-Time Study Group Platform

StudySphere is a full-stack web application that enables students to create study groups, collaborate in real-time, share files, and generate structured discussion summaries within a focused learning environment.

---

## Features

- JWT-based authentication & protected routes
- Create, join, and manage study groups
- Real-time group chat using Socket.IO
- File upload and group-based file storage
- Server-side discussion summary generation
- Group-level admin controls (edit / delete group)
- User profile system with group visibility
- Live registered user counter on homepage
- Responsive and modern UI

---

##  Tech Stack

**Frontend**
- React (Vite)
- React Router
- Axios
- Custom CSS (responsive design)

**Backend**
- Node.js
- Express.js
- MongoDB (Mongoose)
- Socket.IO
- JWT Authentication
- Multer (file uploads)

---

## 🧠 Architecture Highlights

- RESTful API with modular route structure
- Real-time WebSocket communication layer
- Group-level authorization logic
- Scalable backend ready for AI integration
- Clean separation of frontend and backend services


---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/study-group-platform.git
cd study-group-platform

---
**Backend Setup**
cd backend
npm install

**.env**
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLAUD_API=your_claud_api_key

Frontend Port : http://localhost:5173

**Future Enhancements**
-AI-powered advanced summarization (LLM integration)

-Role-based permissions within groups

-Email verification

-Notification system

-Subscription model for AI features






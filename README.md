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






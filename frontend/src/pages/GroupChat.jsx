import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import API from "../services/api";

console.log("GroupChat LOADED - WITH groupId FIX");

const socket = io("http://localhost:5000", {
  autoConnect: false,
});

export default function GroupChat() {
  const { groupId } = useParams();

  const [messages, setMessages] = useState([]);
  const [summary, setSummary] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [text, setText] = useState("");

  const [files, setFiles] = useState([]);
  const [showFiles, setShowFiles] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const [docSummary, setDocSummary] = useState("");
  const [showDocSummary, setShowDocSummary] = useState(false);

  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("token");

  const getUserIdFromToken = () => {
    try {
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.userId || payload.id || null;
    } catch {
      return null;
    }
  };

  const currentUserId = getUserIdFromToken();

  // Fetch old messages
  useEffect(() => {
    const fetchMessages = async () => {
      const res = await API.get(`/messages/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    };

    if (token && groupId) fetchMessages();
  }, [groupId, token]);

  // Setup socket
  useEffect(() => {
    if (!token) return;

    socket.auth = { token };
    socket.connect();
    socket.emit("joinGroup", groupId);

    socket.on("newMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("newMessage");
      socket.disconnect();
    };
  }, [groupId, token]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim()) return;

    socket.emit("sendMessage", { groupId, text });
    setText("");
  };

  const formatTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const generateSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await API.get(`/summary/${groupId}`);
      setSummary(res.data.summary);
      setShowSummary(true);
    } catch (err) {
      console.error("Summary error:", err);
      alert("Failed to generate summary");
    } finally {
      setLoadingSummary(false);
    }
  };

  const loadFiles = async () => {
    setLoadingFiles(true);
    try {
      const res = await API.get(`/files/${groupId}`);
      setFiles(res.data);
    } catch (err) {
      alert("Failed to load files");
    } finally {
      setLoadingFiles(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <h2 style={{ margin: 0 }}>Group Chat</h2>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn btn-info"
              onClick={async () => {
                await loadFiles();
                setShowFiles(true);
              }}
              disabled={loadingFiles}
            >
              {loadingFiles ? "Loading..." : "Files"}
            </button>

            <button
              className="btn btn-purple"
              onClick={generateSummary}
              disabled={loadingSummary}
            >
              {loadingSummary ? "⏳ Generating..." : "Generate Summary"}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chatBox">
          {messages.map((msg, index) => {
            const senderId = msg.sender?._id || msg.sender;
            const isMine =
              senderId &&
              currentUserId &&
              String(senderId) === String(currentUserId);

            const isFile =
              typeof msg.text === "string" && msg.text.includes("http");
            const fileTitle = isFile ? msg.text.split("\n")[0] : "";
            const fileLink = isFile ? msg.text.split("\n")[1] : "";

            return (
              <div
                key={msg._id || `${msg.createdAt}-${index}`}
                className={`chatRow ${isMine ? "mine" : "other"}`}
              >
                <div className={`bubble ${isMine ? "mine" : ""}`}>
                  {!isMine && (
                    <div className="senderName">
                      {msg.sender?.name || "User"}
                    </div>
                  )}

                  {isFile ? (
                    <a
                      href={fileLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: isMine ? "white" : "var(--primary)",
                        textDecoration: "underline",
                        fontWeight: 600,
                      }}
                    >
                      {fileTitle}
                    </a>
                  ) : (
                    <div>{msg.text}</div>
                  )}

                  <div className="meta">{formatTime(msg.createdAt)}</div>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <input
            className="input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            style={{ flex: 1 }}
          />

          <label htmlFor="file-upload" className="btn btn-success">
            📎 File
          </label>

          <input
            id="file-upload"
            type="file"
            style={{ display: "none" }}
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;

              const formData = new FormData();
              formData.append("file", file);
              formData.append("groupId", groupId);

              try {
                const res = await API.post("/files/upload", formData, {
                  headers: { "Content-Type": "multipart/form-data" },
                });

                socket.emit("sendMessage", {
                  groupId,
                  text: `📎 File: ${file.name}\nhttp://localhost:5000/uploads/${res.data.filename}`,
                });

                e.target.value = "";
              } catch (err) {
                alert("File upload failed");
              }
            }}
          />

          <button className="btn btn-primary" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>

      {/* Summary Modal */}
      {showSummary && (
        <div
          onClick={() => setShowSummary(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card"
            style={{ maxWidth: 700, width: "95%", maxHeight: "80vh", overflowY: "auto" }}
          >
            <h3 style={{ marginTop: 0 }}>📊 Chat Summary</h3>

            <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
              {summary}
            </p>

            <button
              onClick={() => setShowSummary(false)}
              className="btn btn-primary"
              style={{ width: "100%", marginTop: 12 }}
            >
              Close
            </button>

          </div>
        </div>
      )}

      {/* Files Modal */}
      {showFiles && (
        <div
          onClick={() => setShowFiles(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1200,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card"
            style={{ width: 800, maxWidth: "95%", maxHeight: "80vh", overflowY: "auto" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>📁 Group Files</h3>
              <button className="btn btn-danger" onClick={() => setShowFiles(false)}>Close</button>
            </div>

            <div style={{ marginTop: 15 }}>
              {files.length === 0 ? (
                <p>No files uploaded yet.</p>
              ) : (
                files.map((f) => (
                  <div
                    key={f._id}
                    style={{
                      padding: 12,
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      marginBottom: 10,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>{f.originalName}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>{f.fileType}</div>
                    </div>

                    <button
                      className="btn btn-primary"
                      onClick={async () => {
                        try {
                          const res = await API.get(`/files/summary/${f._id}`);
                          setDocSummary(res.data.summary);
                          setShowDocSummary(true);
                        } catch (err) {
                          alert(err.response?.data?.message || "Summary failed");
                        }
                      }}
                    >
                      📄 Summarize
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Document Summary Modal */}
      {showDocSummary && (
        <div
          onClick={() => setShowDocSummary(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1300,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card"
            style={{ maxWidth: 800, width: "95%", maxHeight: "80vh", overflowY: "auto" }}
          >
            <h3 style={{ marginTop: 0 }}>📄 Document Summary</h3>

            <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
              {docSummary}
            </p>

            <button className="btn btn-primary" style={{ width: "100%", marginTop: 12 }} onClick={() => setShowDocSummary(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}










// console.log("GroupChat LOADED - WITH groupId FIX");


// import { useEffect, useState, useRef } from "react";
// import { useParams } from "react-router-dom";
// import io from "socket.io-client";
// import API from "../services/api";

// const socket = io("http://localhost:5000", {
//   autoConnect: false
// });

// export default function GroupChat() {
//   const { groupId } = useParams();
//   const [messages, setMessages] = useState([]);
//   const [summary, setSummary] = useState("");
//   const [showSummary, setShowSummary] = useState(false);
//   const [loadingSummary, setLoadingSummary] = useState(false);
//   const [text, setText] = useState("");
//   const [files, setFiles] = useState([]);
//   const [showFiles, setShowFiles] = useState(false);
//   const [loadingFiles, setLoadingFiles] = useState(false);
//   const [docSummary, setDocSummary] = useState("");
//   const [showDocSummary, setShowDocSummary] = useState(false);

//   const messagesEndRef = useRef(null);

//   const token = localStorage.getItem("token");

//   // Fetch old messages
//   useEffect(() => {
//     const fetchMessages = async () => {
//       const res = await API.get(`/messages/${groupId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//       setMessages(res.data);
//     };

//     fetchMessages();
//   }, [groupId, token]);

//   // Setup socket
//   useEffect(() => {
//     if(!token) return;
//     socket.auth = { token };
//     socket.connect();

//     socket.emit("joinGroup", groupId);

//     socket.on("newMessage", message => {
//       setMessages(prev => [...prev, message]);
//     });

//     return () => {
//       socket.off("newMessage");
//       socket.disconnect();
//     };
//   }, [groupId, token]);

//   // Auto-scroll to bottom when messages change
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);


//   // Send message
//   const sendMessage = () => {
//     if (!text.trim()) return;
//     console.log("Sending message:", { groupId, text });

//     socket.emit("sendMessage", {
//       groupId,
//       text
//     });

//     setText("");
//   };

//   const formatTime = (date) => {
//     if (!date) return "";
//     return new Date(date).toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit"
//     });
//   };


//   // Generate summary
//   const generateSummary = async () => {
//     setLoadingSummary(true);
//     try {
//       const res = await API.get(`/summary/${groupId}`);
//       setSummary(res.data.summary);
//       setShowSummary(true);
//     } catch (err) {
//       console.error("Summary error:", err);
//       alert("Failed to generate summary");
//     } finally {
//       setLoadingSummary(false);
//     }
//   };

//   const loadFiles = async () => {
//     setLoadingFiles(true);
//     try {
//       const res = await API.get(`/files/${groupId}`);
//       setFiles(res.data);
//     } catch (err) {
//       alert("Failed to load files");
//     }
//   };

  

//   return (
//     // <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
//     <div className="container">
//       <div className="card">

    
//       {/* Header with Summary Button */}
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>


//         <h2 className="pageTitle">Group Chat</h2>


//         <button
//           className="btn btn-secondary"
//             onClick={async () => {
//             await loadFiles();
//             setShowFiles(true);
//           }}
//         >
//           Files
//         </button>

//         <button
//           className="btn btn-primary"
//           onClick={generateSummary}
//           disabled={loadingSummary}
//       >
//         {loadingSummary ? "⏳ Generating..." : "Generate Summary"}
//       </button>

//       </div>

//       <div
//         style={{
//           border: "1px solid #ccc",
//           height: "400px",
//           overflowY: "auto",
//           padding: "10px",
//           marginBottom: "10px"
//         }}
//       >
//         {messages.map((msg, index) => (
//           <div key={index} style={{ marginBottom: "8px" }}>
//             <div style={{ fontWeight: "bold", fontSize: "14px" }}>
//               {msg.sender?.name || "User"}
//               <span style={{ fontSize: "12px", color: "#888", marginLeft: "6px" }}>
//                 • {formatTime(msg.createdAt)}
//               </span>
//             </div>

//             {msg.text.includes("http") ? (
//               <a 
//                 href={msg.text.split("\n")[1]} 
//                 target="_blank" 
//                 rel="noopener noreferrer"
//                 style={{ color: "#2563eb", textDecoration: "underline" }}
//               >
//                 {msg.text.split("\n")[0]}
//               </a>
//             ) : (
//               msg.text
//            )}
//             <span style={{ marginLeft: "8px", fontSize: "12px", color: "#888" }}>
//               {formatTime(msg.createdAt)}
//             </span>
//           </div>
//         ))}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Message Input Area */}
//       <div style={{ 
//       display: "flex", 
//         gap: "10px", 
//         alignItems: "center",
//         marginTop: "10px" 
//       }}>
//       <input
//         className="input"
//         value={text}
//         onChange={e => setText(e.target.value)}
//         onKeyPress={e => e.key === "Enter" && sendMessage()}
//         placeholder="Type a message..."
//         style={{ flex: 1 }}
//       />

  
//   <label htmlFor="file-upload" className="btn btn-secondary" style={{ margin: 0 }}>
//     📎 File
//   </label>

  
//   <input
//     id="file-upload"
//     type="file"
//     style={{ display: "none" }}
//     onChange={async (e) => {
//       const file = e.target.files[0];
//       if (!file) return;

//       const formData = new FormData();
//       formData.append("file", file);
//       formData.append("groupId", groupId);

//       try {
//         const res = await API.post("/files/upload", formData, {
//           headers: { "Content-Type": "multipart/form-data" }
//         });
        
//         const docId = res.data.document?._id;
//         // Send file link as message
//         socket.emit("sendMessage", {
//           groupId,
//           text: `📎 File: ${file.name}\nhttp://localhost:5000/uploads/${res.data.filename}\nDOC_ID:${docId}`
//         });

//         e.target.value = ""; // Reset input
//       } catch (err) {
//         alert("File upload failed");
//       }
//     }}
//   />
  
//   <button onClick={sendMessage} className="btn btn-primary">
//     Send
//   </button>

//   </div>
//       {/* Summary Display */}
//       {showSummary && (
//       <div
//         style={{
//           position: "fixed",
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           background: "rgba(0,0,0,0.5)",
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           zIndex: 1000
//         }}
//       >
//         <div
//           style={{
//             background: "white",
//             padding: "30px",
//             borderRadius: "8px",
//             maxWidth: "600px",
//             maxHeight: "80vh",
//             overflowY: "auto"
//           }}
//         >
//           <h3>📊 Chat Summary</h3>
//           <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
//             {summary}
//           </p>
//           <button
//             onClick={() => setShowSummary(false)}
//             style={{
//               marginTop: "20px",
//               padding: "10px",
//               width: "100%",
//               background: "#2563eb",
//               color: "white",
//               border: "none",
//               borderRadius: "6px"
//             }}
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     )}

//     {/* Files Display */}
//     {showFiles && (
//   <div
//     onClick={() => setShowFiles(false)}
//     style={{
//     position: "fixed",
//     top: 0, left: 0, right: 0, bottom: 0,
//     background: "rgba(0,0,0,0.5)",
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     zIndex: 1200
//   }}>
//     <div 
//       onClick={(e) => e.stopPropagation()}
//       style={{
//       background: "white",
//       padding: "20px",
//       borderRadius: "8px",
//       width: "700px",
//       maxWidth: "95%",
//       maxHeight: "80vh",
//       overflowY: "auto"
//     }}>
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//         <h3 style={{ margin: 0 }}>📁 Group Files</h3>
//         <button onClick={() => setShowFiles(false)} style={{ border: "none", background: "none", fontSize: "22px", cursor: "pointer" }}>×</button>
//       </div>

//       <div style={{ marginTop: "15px" }}>
//         {files.length === 0 ? (
//           <p>No files uploaded yet.</p>
//         ) : (
//           files.map((f) => (
//             <div key={f._id} style={{
//               padding: "12px",
//               border: "1px solid #eee",
//               borderRadius: "8px",
//               marginBottom: "10px",
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center"
//             }}>
//               <div>
//                 <div style={{ fontWeight: "bold" }}>{f.originalName}</div>
//                 <div style={{ fontSize: "12px", color: "#666" }}>{f.fileType}</div>
//               </div>

//               <button
//                 className="btn btn-primary"
//                 onClick={async () => {
//                 try {
//                   const res = await API.get(`/files/summary/${f._id}`);
//                   setDocSummary(res.data.summary);
//                   setShowDocSummary(true);
//                 } catch (err) {
//                   alert(err.response?.data?.message || "Summary failed");
//                 }
//                 }}
//               >
//                   📄 Summarize
//               </button>

//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   </div>
// )}
//     {/* Document Summary Modal */}
//     {showDocSummary && (
//   <div style={{
//     position: "fixed",
//     top: 0, left: 0, right: 0, bottom: 0,
//     background: "rgba(0,0,0,0.5)",
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     zIndex: 1300
//   }}>
//     <div style={{
//       background: "white",
//       padding: "30px",
//       borderRadius: "8px",
//       maxWidth: "700px",
//       width: "95%",
//       maxHeight: "80vh",
//       overflowY: "auto"
//     }}>
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//         <h3 style={{ margin: 0 }}>📄 Document Summary</h3>
//         <button onClick={() => setShowDocSummary(false)} style={{ border: "none", background: "none", fontSize: "22px", cursor: "pointer" }}>×</button>
//       </div>

//       <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.6", marginTop: "15px" }}>
//         {docSummary}
//       </p>

//       <button
//         onClick={() => setShowDocSummary(false)}
//         className="btn btn-primary"
//         style={{ width: "100%", marginTop: 12 }}
//       >
//         Close
//       </button>

//     </div>
//   </div>
// )}

//       </div>
//     </div>
//   );
// }

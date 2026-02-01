import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function getRoleFromToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return "member";
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || "member";
  } catch {
    return "member";
  }
}


export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });

  const navigate = useNavigate();
  const role = getRoleFromToken();
  const isAdmin = role === "admin";
 

  useEffect(() => {
    fetchGroups();
    fetchAllGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await API.get("/groups/my-groups");
      setGroups(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load groups");
    }
  };

  const fetchAllGroups = async () => {
    try {
      const res = await API.get("/groups/all");
      setAllGroups(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateGroup = async () => {
    try {
      await API.post("/groups/create", newGroup);
      setNewGroup({ name: "", description: "" });
      setShowCreateForm(false);
      await fetchGroups();
      await fetchAllGroups();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create group");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const joinGroup = async (id) => {
    try {
      await API.post(`/groups/join/${id}`);
      await fetchGroups();
      await fetchAllGroups();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to join group");
    }
  };

  const otherGroups = allGroups.filter(
    (g) => !groups.some((my) => my._id === g._id)
  );

  return (
    <div className="container">
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h1
          style={{
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: 10
          }}
        >
          My Study Groups

          <span
            style={{
              fontSize: 12,
              padding: "4px 10px",
              borderRadius: 999,
              background: isAdmin
                ? "rgba(37,99,235,0.12)"
                : "rgba(22,163,74,0.12)",
              color: isAdmin ? "var(--primary)" : "var(--success)",
              border: "1px solid var(--border)",
              fontWeight: 700
            }}
          >
            {isAdmin ? "ADMIN" : "MEMBER"}
          </span>
        </h1>

        <button className="btn btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Create Group Button (Admin only) */}
      {isAdmin && (
        <div style={{ marginBottom: 16 }}>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? "Cancel" : "+ Create New Group"}
          </button>
        </div>
      )}

      {/* Create Group Form */}
      {isAdmin &&showCreateForm && (
        <div className="card" style={{ marginBottom: 18 }}>
          <h3 style={{ marginTop: 0 }}>Create New Group</h3>

          <input
            className="input"
            type="text"
            placeholder="Group Name"
            value={newGroup.name}
            onChange={(e) =>
              setNewGroup({ ...newGroup, name: e.target.value })
            }
            style={{ marginBottom: 10 }}
          />

          <textarea
            className="input"
            placeholder="Description"
            value={newGroup.description}
            onChange={(e) =>
              setNewGroup({ ...newGroup, description: e.target.value })
            }
            style={{ minHeight: 90, resize: "vertical", marginBottom: 10 }}
          />

          <button className="btn btn-success" onClick={handleCreateGroup}>
            Create Group
          </button>
        </div>
      )}

      {/* My Groups */}
      {groups.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: "var(--muted)" }}>
          <p style={{ margin: 0 }}>No groups yet. Create your first group!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {groups.map((group) => (
            <div
              key={group._id}
              className="card"
              onClick={() => navigate(`/groups/${group._id}`)}
              style={{ cursor: "pointer" }}
            >
              <h3 style={{ marginTop: 0, marginBottom: 8 }}>{group.name}</h3>

              <p style={{ marginTop: 0, color: "var(--muted)" }}>
                {group.description || "No description"}
              </p>

              <p style={{ marginBottom: 0, color: "var(--muted)", fontSize: 13 }}>
                {group.members?.length || 0} member(s)
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Other Available Groups */}
      <div style={{ marginTop: 28 }}>
        <h2 style={{ marginBottom: 12 }}>Other Available Groups</h2>

        {otherGroups.length === 0 ? (
          <div className="card" style={{ textAlign: "center", color: "var(--muted)" }}>
            <p style={{ margin: 0 }}>No other groups available to join</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {otherGroups.map((group) => (
              <div
                key={group._id}
                className="card"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div>
                  <h3 style={{ marginTop: 0, marginBottom: 8 }}>{group.name}</h3>
                  <p style={{ marginTop: 0, marginBottom: 0, color: "var(--muted)" }}>
                    {group.description || "No description"}
                  </p>
                </div>

                <button className="btn btn-primary" onClick={() => joinGroup(group._id)}>
                  Join
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}











// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import API from "../services/api";

// // Small helper: read role from JWT without extra libraries
// function getRoleFromToken() {
//   try {
//     const token = localStorage.getItem("token");
//     if (!token) return "member";
//     const payload = JSON.parse(atob(token.split(".")[1]));
//     return payload.role || "member";
//   } catch {
//     return "member";
//   }
// }

// export default function Dashboard() {
//   const [groups, setGroups] = useState([]);
//   const [allGroups, setAllGroups] = useState([]);
//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [newGroup, setNewGroup] = useState({ name: "", description: "" });

//   const navigate = useNavigate();
//   const role = getRoleFromToken();
//   const isAdmin = role === "admin";

//   useEffect(() => {
//     fetchGroups();
//     fetchAllGroups();
//   }, []);

//   const fetchGroups = async () => {
//     try {
//       const res = await API.get("/groups/my-groups");
//       setGroups(Array.isArray(res.data) ? res.data : []);
//     } catch (err) {
//       console.error(err);
//       alert("Failed to load groups");
//     }
//   };

//   const fetchAllGroups = async () => {
//     try {
//       const res = await API.get("/groups/all");
//       setAllGroups(Array.isArray(res.data) ? res.data : []);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleCreateGroup = async () => {
//     try {
//       if (!newGroup.name.trim()) {
//         alert("Group name is required");
//         return;
//       }

//       await API.post("/groups/create", newGroup);
//       setNewGroup({ name: "", description: "" });
//       setShowCreateForm(false);
//       await fetchGroups();
//       await fetchAllGroups();
//     } catch (err) {
//       console.error(err);
//       alert(err.response?.data?.message || "Failed to create group");
//     }
//   };

//   const handleJoinGroup = async (groupId) => {
//     try {
//       await API.post(`/groups/join/${groupId}`);
//       await fetchGroups();
//       await fetchAllGroups();
//     } catch (err) {
//       console.error(err);
//       alert(err.response?.data?.message || "Failed to join group");
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/");
//   };

//   const otherGroups = allGroups.filter(
//     (g) => !groups.some((my) => my._id === g._id)
//   );

//   return (
//     <div className="container">
//       {/* Header */}
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           marginBottom: 18
//         }}
//       >
//         <div>
//           <h1 style={{ margin: 0 }}>My Study Groups</h1>
//           <div style={{ color: "var(--muted)", marginTop: 4, fontSize: 14 }}>
//             Logged in as: <b>{isAdmin ? "Admin" : "Member"}</b>
//           </div>
//         </div>

//         <button className="btn btn-danger" onClick={handleLogout}>
//           Logout
//         </button>
//       </div>

//       {/* Admin Create Group */}
//       {isAdmin && (
//         <div style={{ marginBottom: 16 }}>
//           <button
//             className={`btn ${showCreateForm ? "btn-danger" : "btn-primary"}`}
//             onClick={() => setShowCreateForm(!showCreateForm)}
//           >
//             {showCreateForm ? "Cancel" : "+ Create New Group"}
//           </button>
//         </div>
//       )}

//       {/* Create Group Form (Admin Only) */}
//       {isAdmin && showCreateForm && (
//         <div className="card" style={{ marginBottom: 18 }}>
//           <h3 style={{ marginTop: 0, marginBottom: 14 }}>Create New Group</h3>

//           <input
//             className="input"
//             type="text"
//             placeholder="Group Name"
//             value={newGroup.name}
//             onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
//           />

//           <div style={{ height: 10 }} />

//           <textarea
//             className="input"
//             placeholder="Description"
//             value={newGroup.description}
//             onChange={(e) =>
//               setNewGroup({ ...newGroup, description: e.target.value })
//             }
//             style={{ minHeight: 90, resize: "vertical" }}
//           />

//           <div style={{ height: 12 }} />

//           <button className="btn btn-success" onClick={handleCreateGroup}>
//             Create Group
//           </button>
//         </div>
//       )}

//       {/* My Groups */}
//       {groups.length === 0 ? (
//         <div className="card" style={{ textAlign: "center", color: "var(--muted)" }}>
//           <p style={{ margin: 0 }}>
//             No groups yet{isAdmin ? ". Create your first group!" : ". Ask an admin to create one, or join an existing group below."}
//           </p>
//         </div>
//       ) : (
//         <div style={{ marginBottom: 26 }}>
//           {groups.map((group) => (
//             <div
//               key={group._id}
//               className="card"
//               onClick={() => navigate(`/groups/${group._id}`)}
//               style={{ cursor: "pointer", marginBottom: 12 }}
//             >
//               <h3 style={{ marginTop: 0, marginBottom: 8 }}>{group.name}</h3>
//               <p style={{ marginTop: 0, color: "var(--muted)" }}>
//                 {group.description || "No description"}
//               </p>
//               <p style={{ marginBottom: 0, color: "var(--muted)", fontSize: 13 }}>
//                 {(group.members?.length || 0)} member(s)
//               </p>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Other Available Groups */}
//       <h2 style={{ marginTop: 0 }}>Other Available Groups</h2>

//       {otherGroups.length === 0 ? (
//         <div className="card" style={{ textAlign: "center", color: "var(--muted)" }}>
//           <p style={{ margin: 0 }}>No other groups available to join.</p>
//         </div>
//       ) : (
//         otherGroups.map((group) => (
//           <div
//             key={group._id}
//             className="card"
//             style={{
//               marginBottom: 12,
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//               gap: 12
//             }}
//           >
//             <div style={{ flex: 1 }}>
//               <h3 style={{ marginTop: 0, marginBottom: 8 }}>{group.name}</h3>
//               <p style={{ marginTop: 0, color: "var(--muted)" }}>
//                 {group.description || "No description"}
//               </p>
//               <p style={{ marginBottom: 0, color: "var(--muted)", fontSize: 13 }}>
//                 {(group.members?.length || 0)} member(s)
//               </p>
//             </div>

//             <button
//               className="btn btn-primary"
//               onClick={() => handleJoinGroup(group._id)}
//             >
//               Join
//             </button>
//           </div>
//         ))
//       )}
//     </div>
//   );
// }





// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import API from "../services/api";

// export default function Dashboard() {
//   const [groups, setGroups] = useState([]);
//   const [allGroups, setAllGroups] = useState([]);
//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [newGroup, setNewGroup] = useState({ name: "", description: "" });
//   const navigate = useNavigate();

//   // Fetch user's groups
//   useEffect(() => {
//     fetchGroups();
//     fetchAllGroups();
//   }, []);

//   const fetchGroups = async () => {
//     try {
//       const res = await API.get("/groups/my-groups");
//       setGroups(res.data);
//     } catch (err) {
//       console.error(err);
//       alert("Failed to load groups");
//     }
//   };

//   // Fetch all groups for joining
//   const fetchAllGroups = async () => {
//     try {
//       const res = await API.get("/groups/all");
//       setAllGroups(res.data);
//     } catch (err) {
//       console.error(err);
//       alert("Failed to load all groups");
//     }
//   };


//   // Create new group
//   const handleCreateGroup = async () => {
//     try {
//       await API.post("/groups/create", newGroup);
//       setNewGroup({ name: "", description: "" });
//       setShowCreateForm(false);
//       fetchGroups(); // Refresh list
//       fetchAllGroups(); // Refresh all groups list
//     } catch (err) {
//       alert("Failed to create group");
//     }
//   };

//   // Logout
//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/");
//   };

//   return (
//     <div className="container">

//       {/* Header */}
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
//         <h1 style={{ margin: 0 }}>My Study Groups</h1>

//         <button onClick={handleLogout} className="btn btn-danger">
//           Logout
//         </button>
//       </div>


//       {/* Create Group Button */}
// <div className="container" style={{ paddingTop: 0 }}>
//   <button
//     className={`btn ${showCreateForm ? "btn-danger" : "btn-primary"}`}
//     onClick={() => setShowCreateForm(!showCreateForm)}
//   >
//     {showCreateForm ? "Cancel" : "+ Create New Group"}
//   </button>
// </div>


//       {/* Create Group Form */}
//       {showCreateForm && (
//         <div className="card" style={{ marginTop: 14 }}>

//           <h3 style={{ marginBottom: "15px" }}>Create New Group</h3>
//           <input
//             className="input"
//             type="text"
//             placeholder="Group Name"
//             value={newGroup.name}
//             onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
//             style={{ marginBottom: 10 }}
//           />

//           <textarea
//             className="input"
//             placeholder="Description"
//             value={newGroup.description}
//             onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
//             style={{ minHeight: 90, resize: "vertical", marginBottom: 12 }}
//           />

//           <button onClick={handleCreateGroup} className="btn btn-success">
//             Create Group
//           </button>

//         </div>
//       )}

//       {/* Groups List */}
//       <div style={{ maxWidth: "900px", margin: "0 auto" }}>
//         {groups.length === 0 ? (
//           <div className="card" style={{ textAlign: "center" }}>
//             <p style={{ color: "var(--muted)", margin: 0 }}>
//               No groups yet. Create your first group!
//             </p>
//           </div>

//         ) : (
//           <div style={{ display: "grid", gap: 15 }}>

//             {groups.map((group) => (
//               <div
//                 key={group._id}
//                 className="card"
//                 onClick={() => navigate(`/groups/${group._id}`)}
//                 style={{ cursor: "pointer", marginBottom: 0 }}
//               >
//                 <h3 style={{ marginTop: 0, marginBottom: 8 }}>{group.name}</h3>

//                 <p style={{ marginTop: 0, marginBottom: 10, color: "var(--muted)", fontSize: 14 }}>
//                   {group.description || "No description"}
//                 </p>

//                 <p style={{ margin: 0, color: "var(--muted)", fontSize: 13 }}>
//                   {group.members?.length || 0} member(s)
//                 </p>
//               </div>

//             ))}
//           </div>
//         )}
//       </div>
//       {/* Other Available Groups */}
//       <div style={{ maxWidth: "900px", margin: "40px auto 0" }}>
//         <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "15px" }}>
//           Other Available Groups
//         </h2>
//         {allGroups
//           .filter(group => !groups.some(myGroup => myGroup._id === group._id))
//           .length === 0 ? (
//           <div style={{
//             background: "white",
//             padding: "20px",
//             borderRadius: "8px",
//             textAlign: "center",
//             color: "#666"
//           }}>
//             <p>No other groups available to join</p>
//           </div>
//         ) : (
//           allGroups
//             .filter(group => !groups.some(myGroup => myGroup._id === group._id))
//             .map(group => (
//               <div
//                 key={group._id}
//                 style={{
//                   background: "white",
//                   padding: "20px",
//                   borderRadius: "8px",
//                   marginBottom: "10px",
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                   boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
//                 }}
//               >
//                 <div>
//                   <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>
//                     {group.name}
//                   </h3>
//                   <p style={{ fontSize: "14px", color: "#666" }}>
//                     {group.description || "No description"}
//                   </p>
//                 </div>

//                 <button
//                   onClick={async () => {
//                     try {
//                       await API.post(`/groups/join/${group._id}`);
//                       fetchGroups();
//                       fetchAllGroups();
//                     } catch (err) {
//                       console.error("Join error:", err);
//                       alert("Failed to join group");
//                     }
//                   }}
//                   style={{
//                     padding: "10px 20px",
//                     background: "#2563eb",
//                     color: "white",
//                     border: "none",
//                     borderRadius: "6px",
//                     cursor: "pointer",
//                     fontSize: "14px"
//                   }}
//                 >
//                   Join
//                 </button>
//               </div>
//             ))
//         )}
//       </div>
//     </div>
//   );
// }
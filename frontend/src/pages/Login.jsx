import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "" 
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const url = isRegister ? "/auth/register" : "/auth/login";
      const res = await API.post(url, form);
      
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        navigate("/dashboard");
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
  <div className="container" style={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
    <div className="card" style={{ width: "100%", maxWidth: 420, margin: "0 auto" }}>
      <h2 style={{ marginTop: 0, marginBottom: 16, textAlign: "center" }}>
        {isRegister ? "Register" : "Login"}
      </h2>

      {isRegister && (
        <input
          className="input"
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          style={{ marginBottom: 10 }}
        />
      )}

      <input
        className="input"
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        style={{ marginBottom: 10 }}
      />

      <input
        className="input"
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        style={{ marginBottom: 14 }}
      />

      <button className="btn btn-primary" onClick={handleSubmit} style={{ width: "100%" }}>
        {isRegister ? "Register" : "Login"}
      </button>

      <p
        onClick={() => setIsRegister(!isRegister)}
        style={{
          marginTop: 14,
          textAlign: "center",
          cursor: "pointer",
          color: "var(--primary)",
          fontWeight: 600
        }}
      >
        {isRegister ? "Already have an account? Login" : "No account? Register"}
      </p>
    </div>
  </div>
);

}
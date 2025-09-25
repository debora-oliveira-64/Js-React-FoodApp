import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../components/contexts/authContext";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap/dist/css/bootstrap.min.css";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [registerError, setRegisterError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userData = {
        username: form.username,
        email: form.email,
        password: form.password,
        role: {
          name: "Client",
          scopes: ["client"],
        },
      };

      const success = await register(userData);

      if (success) {
        navigate("/"); 
      }
    } catch (err) {
      console.error("Registration error:", err);
      setRegisterError("Failed to register. Please try again.");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      <div className="card shadow-sm p-4" style={{ maxWidth: "500px", width: "100%" }}>
        <h3 className="text-center mb-4">Register as Client</h3>
        {registerError && <div className="alert alert-danger">{registerError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Username</label>
            <input
              type="text"
              className="form-control"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Register
          </button>
          <div className="text-center mt-3">
              <Link to="/registerRestaurant" className="d-block">
                Registrar como restaurante
              </Link>
            </div>
        </form>
      </div>
    </div>
  );
};

export default Register;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/contexts/authContext";
import useRestaurants from "../components/hooks/useRestaurants";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap/dist/css/bootstrap.min.css";

const RegisterRestaurant = () => {
  const { register } = useAuth();
  const { createRestaurant } = useRestaurants();
  const navigate = useNavigate();

  const [restaurantForm, setRestaurantForm] = useState({
    name: "",
    category: "",
  });

  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const restaurantData = {
        name: restaurantForm.name,
        category: restaurantForm.category,
      };

      const response = await createRestaurant(restaurantData);
      console.log(response)

      const restaurantId = response?.restaurant._id;

      if (!restaurantId) {
        throw new Error("Failed to create restaurant");
      }

      const userData = {
        username: userForm.username,
        email: userForm.email,
        password: userForm.password,
        role: {
          name: "Restaurant",
          scopes: ["restaurant"],
        },
        ifRestaurant: restaurantId, 
      };

      const success = await register(userData);

      if (success) {
        navigate("/dashboard"); 
      } else {
        throw new Error("Failed to register user");
      }
    } catch (err) {
      console.error("Error during registration:", err);
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      <div className="card shadow-sm p-4" style={{ maxWidth: "500px", width: "100%" }}>
        <h3 className="text-center mb-4">Register Restaurant</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <h5 className="mb-3">Restaurant Information</h5>
          <div className="mb-3">
            <label>Restaurant Name</label>
            <input
              type="text"
              className="form-control"
              value={restaurantForm.name}
              onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label>Category</label>
            <input
              type="text"
              className="form-control"
              value={restaurantForm.category}
              onChange={(e) => setRestaurantForm({ ...restaurantForm, category: e.target.value })}
              required
            />
          </div>

          <h5 className="mb-3">User Information</h5>
          <div className="mb-3">
            <label>Username</label>
            <input
              type="text"
              className="form-control"
              value={userForm.username}
              onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              value={userForm.password}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterRestaurant;

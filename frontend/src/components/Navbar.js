import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./contexts/authContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  console.log(user);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand" to="/">
          FoodToGo
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {user?.includes("restaurant") && (
              <li className="nav-item">
                <Link
                  className={`nav-link ${
                    location.pathname === "/restaurantDashboard" ? "active" : ""
                  }`}
                  to="/restaurantDashboard"
                >
                  Dashboard
                </Link>
              </li>
            )}
            {user?.includes("client") && (
              <>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${
                      location.pathname === "/cart" ? "active" : ""
                    }`}
                    to="/cart"
                  >
                    Cart
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${
                      location.pathname === "/clientDashboard" ? "active" : ""
                    }`}
                    to="/clientDashboard"
                  >
                    Profile
                  </Link>
                </li>
              </>
            )}
            {user?.includes("admin") && (
              <li className="nav-item">
                <Link
                  className={`nav-link ${
                    location.pathname === "/adminDashboard" ? "active" : ""
                  }`}
                  to="/adminDashboard"
                >
                  AdminDashboard
                </Link>
              </li>
            )}
            {user && (
              <li className="nav-item">
                <button
                  className="btn btn-outline-danger"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            )}
            {!user && (
              <li className="nav-item">
                <Link
                  className={`nav-link ${
                    location.pathname === "/login" ? "active" : ""
                  }`}
                  to="/login"
                >
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

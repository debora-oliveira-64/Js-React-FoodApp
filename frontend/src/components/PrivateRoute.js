import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./contexts/authContext";

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && !user.some((role) => roles.includes(role))) {
    return <Navigate to="/" />;
  }  

  return children;
};

export default PrivateRoute;

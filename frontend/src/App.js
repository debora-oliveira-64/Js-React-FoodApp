import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import Register from "./pages/Register";
import RestaurantDetails from "./pages/Restaurant";
import ShoppingCart from "./pages/ShoppingCart";
import PlateDetails from "./pages/Plate";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import ResetPassword from "./pages/ResetPassword";
import RegisterRestaurant from "./pages/RegisterRestaurant";
import { AuthProvider } from "./components/providers/authProvider";
import PrivateRoute from "./components/PrivateRoute";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <AuthProvider>
      <Router>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main>
          <ToastContainer />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/resetPassword" element={<ResetPassword />} />
            <Route
              path="/registerRestaurant"
              element={<RegisterRestaurant />}
            />
            <Route
              path="/restaurants/:id"
              element={
                <PrivateRoute roles={["admin"]  && ["restaurant"] && ["client"]}>
                  <RestaurantDetails />
                </PrivateRoute>
              }
            />
                        <Route
              path="/restaurants/:restaurantId/plates/:plateId"
              element={
                <PrivateRoute roles={["admin"] && ["restaurant"] && ["client"]}>
                  <PlateDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/adminDashboard"
              element={
                <PrivateRoute roles={["admin"]}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/restaurantDashboard"
              element={
                <PrivateRoute roles={["restaurant"]}>
                  <RestaurantDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/clientDashboard"
              element={
                <PrivateRoute roles={["client"]}>
                  <ClientDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <PrivateRoute roles={["client"]}>
                  <ShoppingCart />
                </PrivateRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
        </div>  
      </Router>
    </AuthProvider>
  );
}

export default App;

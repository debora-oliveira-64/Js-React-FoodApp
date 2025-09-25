import React, { useState, useEffect } from "react";
import useOrders from "../components/hooks/useOrders";
import { useAuth } from "../components/contexts/authContext";
import "bootstrap/dist/css/bootstrap.min.css";

const ShoppingCart = () => {
  const [cart, setCart] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0); 
  const CART_EXPIRY_TIME = 10 * 60 * 1000; 
  const { createOrder }  = useOrders();
  const { userId } = useAuth();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartTimestamp = localStorage.getItem("cartTimestamp");

    if (savedCart.length && cartTimestamp) {
      const now = Date.now();
      const timeSinceLastUpdate = now - parseInt(cartTimestamp, 10);

      if (timeSinceLastUpdate < CART_EXPIRY_TIME) {
        setCart(savedCart);
        const remainingTime = CART_EXPIRY_TIME - timeSinceLastUpdate;
        setTimeLeft(remainingTime);
        startAutoClearTimer(remainingTime);
      } else {
        clearCart();
      }
    }
  }, []);

  const startAutoClearTimer = (timeLeft) => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          clearInterval(interval);
          clearCart();
          return 0;
        }
        return prev - 1000; 
      });
    }, 1000);

    setTimeout(() => {
      clearCart();
      clearInterval(interval);
    }, timeLeft);
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
    localStorage.removeItem("cartTimestamp");
    alert("Your cart has expired.");
  };

  const removeItem = (index) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);

    if (updatedCart.length === 0) {
      localStorage.removeItem("cart");
      localStorage.removeItem("cartTimestamp");
    } else {
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      localStorage.setItem("cartTimestamp", Date.now().toString());
    }
  };

  const formatTimeLeft = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getTotalPrice = () =>
    cart.reduce((total, item) => total + item.price, 0);

  if (cart.length === 0) {
    return (
      <div className="container mt-5 text-center">
        <h2>Your cart is empty</h2>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const orderData = {
      user: userId,
      plates: cart.map((item) => ({
        restaurant: item.restaurantId,
        plate: item.plateId, 
        dose: item.dose,
        price: item.price,
      })),
      totalPrice: getTotalPrice(),
      date: new Date(),
    };

    try {
      await createOrder(orderData);
      alert("Order placed successfully!");
      clearCart(); 
    } catch (error) {
      alert("Failed to place the order. Please try again.");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Shopping Cart</h2>
      <div className="text-end mb-3">
        <strong>Cart expires in: {formatTimeLeft(timeLeft)}</strong>
      </div>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Plate</th>
            <th>Dose</th>
            <th>Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.dose}</td>
              <td>${item.price.toFixed(2)}</td>
              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => removeItem(index)}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-end">
        <h4>Total: ${getTotalPrice().toFixed(2)}</h4>
        <button className="btn btn-primary" onClick={handleCheckout}>
          Checkout
        </button>
      </div>
    </div>
  );
};

export default ShoppingCart;

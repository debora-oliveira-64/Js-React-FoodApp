import { useState, useEffect, useCallback } from "react";

const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch("/orders", {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error("Error fetching monthly fees:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdersByClient = async (clientId, limit = 10, skip = 0) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/orders/client/${clientId}?limit=${limit}&skip=${skip}`,
        {
          headers: { Accept: "application/json" },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch orders for client with ID: ${clientId}`);
      }
      const data = await response.json();
      setOrders(data.data);
    } catch (err) {
      console.error("Error fetching orders by client:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdersByRestaurant = useCallback(async (restaurantId, limit = 10, skip = 0) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/orders/restaurant/${restaurantId}?limit=${limit}&skip=${skip}`,
        {
          headers: { Accept: "application/json" },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch orders for restaurant with ID: ${restaurantId}`);
      }
      const data = await response.json();
      setOrders(data.data);
    } catch (err) {
      console.error("Error fetching orders by restaurant:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrdersById = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`/orders/${id}`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch order with ID: ${id}`);
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error fetching order by ID:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (data) => {
    try {
      const response = await fetch("/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create monthly fee");
      }

    } catch (err) {
      console.error("Error creating order:", err);
      setError(err.message);
    }
  };

  const updateOrder = async (id, updates) => {
    try {
      const response = await fetch(`/orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error(`Failed to update order with ID: ${id}`);
      }
      const updated = await response.json();
      setOrders((prevOrders) => {
        if (Array.isArray(prevOrders)) {
          return prevOrders.map((fee) => (fee._id === id ? updated : fee));
        }
        return [updated]; 
      });
    } catch (err) {
      console.error("Error updating order:", err);
      setError(err.message);
    }
  };

  const loadOrders = (clientId) => {
    if (clientId) {
      fetchOrdersByClient(clientId);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    fetchOrdersByClient,
    fetchOrdersByRestaurant,
    fetchOrdersById,
    createOrder,
    updateOrder,
    loadOrders,
  };
};

export default useOrders;

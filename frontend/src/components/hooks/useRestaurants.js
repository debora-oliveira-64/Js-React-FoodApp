import { useState, useEffect, useCallback } from "react";

const useRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/restaurants/");
      if (!response.ok) {
        throw new Error("Failed to fetch restaurants");
      }
      const data = await response.json();
      setRestaurants(data.data);
    } catch (err) {
      console.error("Error fetching restaurants:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRestaurantById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/restaurants/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch restaurant with ID: ${id}`);
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error fetching restaurant by ID:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createRestaurant = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create restaurant");
      }
      const createdRestaurant = await response.json();
      console.log("Created Restaurant:", createdRestaurant);

      fetchRestaurants();
      return createdRestaurant;
    } catch (err) {
      console.error("Error creating restaurant:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateRestaurant = async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/restaurants/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Failed to update restaurant with ID: ${id}`);
      }
      await response.json();
      fetchRestaurants();
    } catch (err) {
      console.error("Error updating restaurant:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteRestaurant = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/restaurants/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Failed to delete restaurant with ID: ${id}`);
      }
      fetchRestaurants();
    } catch (err) {
      console.error("Error deleting exam:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addPlateToRestaurant = async (id, plateId) => {
    console.log("Adding plate to restaurant", { id, plateId });
    setLoading(true);
    setError(null);

    const restaurant = await fetchRestaurantById(id);
    console.log(restaurant);
    const plates = [...restaurant.plates, plateId];
    try {
      const response = await fetch(`/restaurants/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plates }),
      });
      if (!response.ok) {
        throw new Error(
          `Failed to add plate with ID: ${plateId} to restaurant ID: ${id}`
        );
      }
      await response.json();
      fetchRestaurants();
    } catch (err) {
      console.error("Error adding plate to restaurant:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  return {
    restaurants,
    loading,
    error,
    fetchRestaurants,
    fetchRestaurantById,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    addPlateToRestaurant,
  };
};

export default useRestaurants;

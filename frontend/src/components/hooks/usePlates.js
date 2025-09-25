import { useState } from "react";
import useRestaurants from "./useRestaurants";

const usePlates = () => {
  const [plates, setPlates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addPlateToRestaurant } = useRestaurants();

  const fetchPlateById = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/plates/${id}`, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch plate with ID: ${id}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error fetching plate by ID:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createPlate = async (data, restaurantId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/plates/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create plate");
      }

      const newPlate = await response.json();

      if (restaurantId) {
        await addPlateToRestaurant(restaurantId, newPlate.plate._id.toString());
      }

      setPlates((prev) => [...prev, newPlate]);
    } catch (err) {
      console.error("Error creating plate:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePlate = async (id, updateData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/plates/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update plate with ID: ${id}`);
      }

      const updatedPlate = await response.json();
      setPlates((prev) =>
        prev.map((plate) =>
          plate.id === id ? updatedPlate : plate
        )
      );
      
    } catch (err) {
      console.error("Error updating plate:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deletePlate = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/plates/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete plate with ID: ${id}`);
      }

      setPlates((prev) => prev.filter((plate) => plate.id !== id));
    } catch (err) {
      console.error("Error deleting plate:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    plates,
    loading,
    error,
    fetchPlateById,
    createPlate,
    updatePlate,
    deletePlate,
  };
};

export default usePlates;

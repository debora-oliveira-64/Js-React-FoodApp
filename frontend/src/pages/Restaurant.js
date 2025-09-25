import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; 
import useRestaurants from "../components/hooks/useRestaurants";
import PlateCard from "../components/cards/plateCard";
import "bootstrap/dist/css/bootstrap.min.css";

const RestaurantDetails = () => {
  const { id } = useParams(); 
  const { fetchRestaurantById, loading, error } = useRestaurants();
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    let isMounted = true; 
    const fetchDetails = async () => {
      const data = await fetchRestaurantById(id);
      if (isMounted && data) {
        setRestaurant(data);
      }
    };
    fetchDetails();
    return () => {
      isMounted = false; 
    };
  }, [id, fetchRestaurantById]);

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="text-center mt-5 text-danger">{error}</div>;
  if (!restaurant) return <div className="text-center mt-5">No restaurant found</div>;

  return (
    <div className="container mt-4">
      <div className="row">
        {restaurant.plates.map((plate) => (
          <div className="col-md-4 mb-4" key={plate._id}>
            <PlateCard plate={plate} restaurantId={restaurant._id}/>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantDetails;

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useRestaurants from "../components/hooks/useRestaurants";
import { usePostUploadData } from "../components/hooks/usePostUploadData"; 
import "bootstrap/dist/css/bootstrap.min.css";

const PlateDetails = () => {
  const { restaurantId, plateId } = useParams();
  const { fetchRestaurantById, loading, error } = useRestaurants();
  const { getImage } = usePostUploadData();
  const [restaurant, setRestaurant] = useState(null);
  const [plate, setPlate] = useState(null);
  const [images, setImages] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    let isMounted = true; 
    const fetchDetails = async () => {
      const data = await fetchRestaurantById(restaurantId);
      if (isMounted && data) {
        setRestaurant(data);

        const selectedPlate = data.plates.find((p) => p._id === plateId);
        setPlate(selectedPlate);

        if (selectedPlate && selectedPlate.images && selectedPlate.images.length > 0) {
          const fetchedImages = await Promise.all(
            selectedPlate.images.map((imageName) => getImage(imageName))
          );
          setImages(fetchedImages);
        }
      }
    };
    fetchDetails();

    return () => {
      isMounted = false;
    };
  }, [restaurantId, plateId, fetchRestaurantById]);

  const addToCart = (dose) => {
    const cartItem = {
      restaurantId: restaurantId,
      plateId: plate._id,
      name: plate.name,
      dose: dose.type,
      price: dose.price,
    };

    const updatedCart = [...cart, cartItem];
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    localStorage.setItem("cartTimestamp", Date.now().toString()); // Set timestamp
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="text-center mt-5 text-danger">{error}</div>;
  if (!restaurant || !plate)
    return <div className="text-center mt-5">Plate not found</div>;

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">{restaurant.name}</h1>
      <div className="row">
        <div className="col-md-6">
          <div
            id="carouselExampleIndicators"
            className="carousel slide"
            data-bs-ride="carousel"
          >
            <div className="carousel-inner">
              {images.length > 0 ? (
                images.map((imageUrl, index) => (
                  <div
                    key={index}
                    className={`carousel-item ${index === 0 ? "active" : ""}`}
                  >
                    <img
                      src={imageUrl}
                      className="d-block w-100"
                      alt={plate.name}
                      style={{ objectFit: "cover", height: "300px" }}
                    />
                  </div>
                ))
              ) : (
                <div className="carousel-item active">
                  <img
                    src="https://via.placeholder.com/500x300"
                    className="d-block w-100"
                    alt="Placeholder"
                    style={{ objectFit: "cover", height: "300px" }}
                  />
                </div>
              )}
            </div>
            <button
              className="carousel-control-prev"
              type="button"
              data-bs-target="#carouselExampleIndicators"
              data-bs-slide="prev"
            >
              <span
                className="carousel-control-prev-icon"
                aria-hidden="true"
              ></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button
              className="carousel-control-next"
              type="button"
              data-bs-target="#carouselExampleIndicators"
              data-bs-slide="next"
            >
              <span
                className="carousel-control-next-icon"
                aria-hidden="true"
              ></span>
              <span className="visually-hidden">Next</span>
            </button>
          </div>
        </div>
        <div className="col-md-6">
          <h2>{plate.name}</h2>
          <p className="text-muted">{plate.description}</p>
          <p>
            <strong>Type:</strong> {plate.type}
          </p>
          <p>
            <strong>Nutritional Value:</strong> {plate.nutrionalValue}
          </p>
          <h5>Doses</h5>
          <ul className="list-group">
            {plate.dose.map((d, index) => (
              <li
                key={index}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>
                  {d.type} - <strong>${d.price}</strong>
                </span>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => addToCart(d)}
                >
                  Add to Cart
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PlateDetails;

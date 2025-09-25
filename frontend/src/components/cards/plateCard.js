import React, { useEffect, useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { usePostUploadData } from "../hooks/usePostUploadData"; 
import { useNavigate } from "react-router-dom";

const PlateCard = ({ plate, restaurantId }) => {
  const { getImage } = usePostUploadData(); 
  const [firstImage, setFirstImage] = useState(
    "https://via.placeholder.com/300x200"
  ); 
  const navigate = useNavigate();
  const isImageFetched = useRef(false);

  useEffect(() => {
    const fetchFirstImage = async () => {
      if (isImageFetched.current || !plate.images || plate.images.length === 0) return;

      const imageUrl = await getImage(plate.images[0]);
      if (imageUrl) {
        setFirstImage(imageUrl);
        isImageFetched.current = true; 
      }
    };

    fetchFirstImage();
  }, [plate.images, getImage]);

  const handleCardClick = () => {
    navigate(`/restaurants/${restaurantId}/plates/${plate._id}`); 
  };

  return (
    <div
    className="card shadow-sm"
    style={{ width: "18rem", cursor: "pointer" }}
    onClick={handleCardClick}
  >
      <img
        src={firstImage}
        className="card-img-top"
        alt={plate.name}
        style={{ objectFit: "cover", height: "150px" }}
      />
      <div className="card-body">
        <h5 className="card-title">{plate.name}</h5>
        <p className="card-text text-muted">
          {plate.description
            ? plate.description.slice(0, 100) + "..."
            : "No description available"}
        </p>
        <p>
          <strong>Type:</strong> {plate.type}
        </p>
        {plate.dose && plate.dose.length > 0 && (
          <p>
            <strong>Starting Price:</strong> ${plate.dose[0].price}
          </p>
        )}
      </div>
    </div>
  );
};

export default PlateCard;

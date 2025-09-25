import React, { useState } from "react";
import { Container, Row, Col, Card, ListGroup, Button } from "react-bootstrap";
import { useUserDetails } from "../components/hooks/getUserDetails";
import useRestaurants from "../components/hooks/useRestaurants";

const AdminDashboard = () => {
  const { userDetails, error, loadingDetails } = useUserDetails();
  const {
    restaurants,
    loading: loadingRestaurants,
    error: restaurantError,
    updateRestaurant,
  } = useRestaurants();

  const [selectedSection, setSelectedSection] = useState("profile");

  const handleValidate = async (id) => {
    try {
      await updateRestaurant(id, { valid: true });
      alert("Restaurant validated successfully.");
    } catch (err) {
      alert("Failed to validate restaurant.");
    }
  };

  const handleBan = async (id) => {
    try {
      await updateRestaurant(id, { valid: false });
      alert("Restaurant banned successfully.");
    } catch (err) {
      alert("Failed to ban restaurant.");
    }
  };

  const renderSection = () => {
    switch (selectedSection) {
      case "profile":
        return (
          <Card>
            <Card.Body>
              <Card.Title>Profile</Card.Title>
              {loadingDetails ? (
                <p>Loading profile...</p>
              ) : error ? (
                <p>{error}</p>
              ) : userDetails ? (
                <div>
                  <p><strong>Username:</strong> {userDetails.username}</p>
                  <p><strong>Email:</strong> {userDetails.email}</p>
                  <p><strong>Role:</strong> {userDetails.role.name}</p>
                </div>
              ) : (
                <p>No profile information available.</p>
              )}
            </Card.Body>
          </Card>
        );

        case "restaurants":
            return (
              <Card>
                <Card.Body>
                  <Card.Title>Restaurants</Card.Title>
                  {loadingRestaurants ? (
                    <p>Loading restaurants...</p>
                  ) : restaurantError ? (
                    <p>{restaurantError}</p>
                  ) : (
                    <div>
                      <h5>Valid Restaurants</h5>
                      {restaurants
                        .filter((restaurant) => restaurant.valid)
                        .map((restaurant) => (
                          <div key={restaurant._id} className="mb-3">
                            <strong>{restaurant.name}</strong>
                            <p>Category: {restaurant.category}</p>
                            <Button
                              variant="danger"
                              onClick={() => handleBan(restaurant._id)}
                            >
                              Ban
                            </Button>
                          </div>
                        ))}
          
                      <h5 className="mt-4">Invalid Restaurants</h5>
                      {restaurants
                        .filter((restaurant) => !restaurant.valid)
                        .map((restaurant) => (
                          <div key={restaurant._id} className="mb-3">
                            <strong>{restaurant.name}</strong>
                            <p>Category: {restaurant.category}</p>
                            <Button
                              variant="success"
                              onClick={() => handleValidate(restaurant._id)}
                            >
                              Validate
                            </Button>
                          </div>
                        ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            );
          

      default:
        return null;
    }
  };

  return (
    <Container className="my-5">
      <Row>
        <Col md={3}>
          <Card>
            <Card.Header>Dashboard</Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item action onClick={() => setSelectedSection("profile")}>
                Profile
              </ListGroup.Item>
              <ListGroup.Item action onClick={() => setSelectedSection("restaurants")}>
                Restaurants
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
        <Col md={9}>{renderSection()}</Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;

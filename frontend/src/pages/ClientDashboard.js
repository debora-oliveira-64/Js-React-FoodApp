import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, ListGroup } from "react-bootstrap";
import { useUserDetails } from "../components/hooks/getUserDetails";
import useOrders from "../components/hooks/useOrders";
import { toast } from "react-toastify";
import io from "socket.io-client";

const ClientDashboard = () => {
  const { userDetails, error, loadingDetails } = useUserDetails();
  const {
    orders,
    loading,
    error: orderError,
    fetchOrdersByClient,
  } = useOrders();
  const [selectedSection, setSelectedSection] = useState("profile");

  useEffect(() => {
    if (userDetails && userDetails._id) {
      fetchOrdersByClient(userDetails._id);
    }
  }, [userDetails]);

  useEffect(() => {
    const socket = io("http://localhost:5000", {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const id = userDetails?._id;

    socket.on("connect", () => {
      console.log("Connected to Socket.IO server");
      if (id) {
        socket.emit("join-user-room", id);
      }
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    socket.on("order-updated", (data) => {
      console.log("A order was updated:", data);
      toast.info(`New: ${data.message}`);
      console.log("order details:", data.orderDetails);
      fetchOrdersByClient(userDetails._id);
    });

    return () => {
      socket.disconnect();
    };
  }, [userDetails, fetchOrdersByClient]);

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
                  <p>
                    <strong>Username:</strong> {userDetails.username}
                  </p>
                  <p>
                    <strong>Email:</strong> {userDetails.email}
                  </p>
                  <p>
                    <strong>Role:</strong> {userDetails.role.name}
                  </p>
                </div>
              ) : (
                <p>No profile information available.</p>
              )}
            </Card.Body>
          </Card>
        );

      case "orders":
        return (
          <Card>
            <Card.Body>
              <Card.Title>Orders</Card.Title>
              {loading ? (
                <p>Loading orders...</p>
              ) : orderError ? (
                <p>{orderError}</p>
              ) : orders ? (
                <>
                  <h5>Active Orders</h5>
                  {orders.filter((order) => order.status === "expedida")
                    .length > 0 ? (
                    orders
                      .filter((order) => order.status === "expedida")
                      .map((order) => (
                        <Card className="mb-3" key={order._id}>
                          <Card.Body>
                            <Card.Title>
                              {new Date(order.date).toLocaleDateString()}
                            </Card.Title>
                            <p>
                              <strong>Total Price:</strong> $
                              {order.totalPrice.toFixed(2)}
                            </p>
                            <p>
                              <strong>Plates:</strong>
                            </p>
                            <ul>
                              {order.plates.map((plate, index) => (
                                <li key={index}>
                                  <strong>Plate:</strong> {plate.plate.name} |
                                  <strong> Dose:</strong> {plate.dose} |
                                  <strong> Price:</strong> $
                                  {plate.price.toFixed(2)}
                                </li>
                              ))}
                            </ul>
                            <p>
                              <strong>Status:</strong> {order.status}
                            </p>
                          </Card.Body>
                        </Card>
                      ))
                  ) : (
                    <p>No active orders.</p>
                  )}

                  <h5 className="mt-4">Order History</h5>
                  {orders.filter((order) => order.status === "entregue")
                    .length > 0 ? (
                    orders
                      .filter((order) => order.status === "entregue")
                      .map((order) => (
                        <Card className="mb-3" key={order._id}>
                          <Card.Body>
                            <Card.Title>Date: {new Date(order.date).toLocaleDateString()}</Card.Title>
                            <p>
                              <strong>Total Price:</strong> $
                              {order.totalPrice.toFixed(2)}
                            </p>
                            <p>
                              <strong>Plates:</strong>
                            </p>
                            <ul>
                              {order.plates.map((plate, index) => (
                                <li key={index}>
                                  <strong>Plate:</strong> {plate.plate.name} |
                                  <strong> Dose:</strong> {plate.dose} |
                                  <strong> Price:</strong> $
                                  {plate.price.toFixed(2)}
                                </li>
                              ))}
                            </ul>
                            <p>
                              <strong>Status:</strong> {order.status}
                            </p>
                          </Card.Body>
                        </Card>
                      ))
                  ) : (
                    <p>No past orders found.</p>
                  )}
                </>
              ) : (
                <p>No orders found.</p>
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
              <ListGroup.Item
                action
                onClick={() => setSelectedSection("profile")}
              >
                Profile
              </ListGroup.Item>
              <ListGroup.Item
                action
                onClick={() => setSelectedSection("orders")}
              >
                Orders
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
        <Col md={9}>{renderSection()}</Col>
      </Row>
    </Container>
  );
};

export default ClientDashboard;

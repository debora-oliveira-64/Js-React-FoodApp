"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  Button,
  Form,
  Modal,
} from "react-bootstrap";
import { useUserDetails } from "../components/hooks/getUserDetails";
import usePlates from "../components/hooks/usePlates";
import { usePostUploadData } from "../components/hooks/usePostUploadData";
import useOrders from "../components/hooks/useOrders";
import { toast } from "react-toastify";
import io from "socket.io-client";  

const RestaurantDashboard = () => {
  const { userDetails, error: userError, loadingDetails } = useUserDetails();
  const {
    updatePlate,
    createPlate,
    deletePlate,
    loading: plateLoading,
    error: plateError,
  } = usePlates();
  const {
    addData: uploadImage,
    isLoading: imageUploading,
    isError: imageError,
  } = usePostUploadData("upload-image");
  const {
    orders,
    loading: ordersLoading,
    error: ordersError,
    fetchOrdersByRestaurant,
    updateOrder
  } = useOrders();

  const [selectedSection, setSelectedSection] = useState("profile");
  const [showPlateForm, setShowPlateForm] = useState(false);
  const [editingPlate, setEditingPlate] = useState(null);
  const [ordersFetched, setOrdersFetched] = useState(false);

  const [plateForm, setPlateForm] = useState({
    name: "",
    type: "",
    dose: [{ type: "", price: 0 }],
    images: "",
    description: "",
    nutritionalValue: "",
  });

  const fetchOrders = useCallback(async () => {
    if (userDetails?.ifRestaurant?._id && !ordersFetched) {
      await fetchOrdersByRestaurant(userDetails.ifRestaurant._id);
      setOrdersFetched(true);
    }
  }, [userDetails, fetchOrdersByRestaurant, ordersFetched]);

  useEffect(() => {
    fetchOrders();
    console.log(orders);
  }, [fetchOrders]);

  useEffect(() => {
    const socket = io("http://localhost:5000", {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    const restaurantId = userDetails?.ifRestaurant?._id

    socket.on("connect", () => {
      console.log("Connected to Socket.IO server")
      if (restaurantId) {
        socket.emit("join-restaurant-room", restaurantId)
      }
    })

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error)
    })

    socket.on("new-order", (data) => {
      console.log("New order event received:", data);
      toast.info(`New order: ${data.message}`)
      console.log("New order details:", data.orderDetails)
      fetchOrders()
    })

    socket.on("order-updated", (updatedOrder) => {
      toast.success(`Order updated: ${updatedOrder.status}`)
      fetchOrders()
    })

    return () => {
      socket.disconnect()
    }
  }, [userDetails, fetchOrders])

  const handlePlateFormChange = (e) => {
    const { name, value } = e.target;
    setPlateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDoseChange = (index, field, value) => {
    const newDoses = [...plateForm.dose];
    newDoses[index][field] = value;
    setPlateForm((prev) => ({ ...prev, dose: newDoses }));
  };

  const addDose = () => {
    setPlateForm((prev) => ({
      ...prev,
      dose: [...prev.dose, { type: "", price: 0 }],
    }));
  };

  const removeDose = (index) => {
    const newDoses = plateForm.dose.filter((_, i) => i !== index);
    setPlateForm((prev) => ({ ...prev, dose: newDoses }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);

      try {
        const result = await uploadImage(formData);
        if (result && result.imageUrl) {
          setPlateForm((prev) => ({
            ...prev,
            images: [...(prev.images || []), result.imageUrl],
          }));
        } else {
          console.error("No image URL found in the response:", result);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  const handleSubmitPlate = async (e) => {
    e.preventDefault();
    try {
      if (editingPlate) {
        await updatePlate(editingPlate._id, plateForm);
      } else {
        await createPlate(plateForm, userDetails.ifRestaurant._id);
      }

      setShowPlateForm(false);
      setEditingPlate(null);
      setPlateForm({
        name: "",
        type: "",
        dose: [{ type: "", price: 0 }],
        images: "",
        description: "",
        nutritionalValue: "",
      });
    } catch (err) {
      console.error("Error saving plate:", err);
    }
  };

  const startEditPlate = (plate) => {
    setEditingPlate(plate);
    setPlateForm(plate);
    setShowPlateForm(true);
  };

  const removePlate = async (plateId) => {
    try {
      await deletePlate(plateId);
    } catch (err) {
      console.error("Error deleting plate:", err);
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
              ) : userError ? (
                <p>{userError}</p>
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
              {ordersLoading ? (
                <p>Loading orders...</p>
              ) : ordersError ? (
                <p>{ordersError}</p>
              ) : orders && orders.length > 0 ? (
                <ListGroup>
                  {orders.map((order) => (
                    <ListGroup.Item key={order._id}>
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
                          {order.status === "expedida" && (
                            <Button
                              variant="success"
                              onClick={async () => {
                                try {
                                  await updateOrder(order._id, {
                                    status: "entregue",
                                  });
                                  fetchOrders(); 
                                } catch (error) {
                                  console.error(
                                    "Error updating order status:",
                                    error
                                  );
                                }
                              }}
                            >
                              Mark as Delivered
                            </Button>
                          )}
                        </Card.Body>
                      </Card>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p>No orders available.</p>
              )}
            </Card.Body>
          </Card>
        );

      case "plates":
        return (
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Card.Title>Plates</Card.Title>
                <Button
                  variant="primary"
                  onClick={() => setShowPlateForm(true)}
                  disabled={userDetails?.ifRestaurant?.plates?.length >= 10}
                >
                  Add New Plate
                </Button>
              </div>
              {loadingDetails || plateLoading ? (
                <p>Loading plates...</p>
              ) : userError || plateError ? (
                <p>{userError || plateError}</p>
              ) : userDetails &&
                userDetails.ifRestaurant &&
                userDetails.ifRestaurant.plates ? (
                <ListGroup>
                  {userDetails.ifRestaurant.plates.map((plate) => (
                    <ListGroup.Item
                      key={plate._id}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <h5>{plate.name}</h5>
                        <p>Type: {plate.type}</p>
                      </div>
                      <div>
                        <Button
                          variant="outline-primary"
                          className="me-2"
                          onClick={() => startEditPlate(plate)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          onClick={() => removePlate(plate._id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p>No plates available.</p>
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
              <ListGroup.Item
                action
                onClick={() => setSelectedSection("plates")}
              >
                Plates
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
        <Col md={9}>{renderSection()}</Col>
      </Row>

      <Modal
        show={showPlateForm}
        onHide={() => {
          setShowPlateForm(false);
          setEditingPlate(null);
          setPlateForm({
            name: "",
            type: "",
            dose: [{ type: "", price: 0 }],
            images: "",
            description: "",
            nutritionalValue: "",
          });
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingPlate ? "Edit Plate" : "Add New Plate"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitPlate}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={plateForm.name}
                onChange={handlePlateFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select
                name="type"
                value={plateForm.type}
                onChange={handlePlateFormChange}
                required
              >
                <option value="">Select type</option>
                <option value="Carne">Meat</option>
                <option value="Peixe">Fish</option>
                <option value="Vegetariano">Vegan</option>
                <option value="Sobremessa">Dessert</option>
              </Form.Select>
            </Form.Group>
            {plateForm.dose.map((dose, index) => (
              <div key={index} className="mb-3">
                <Form.Group>
                  <Form.Label>Dose Type</Form.Label>
                  <Form.Select
                    value={dose.type}
                    onChange={(e) =>
                      handleDoseChange(index, "type", e.target.value)
                    }
                    required
                  >
                    <option value="">Select dose</option>
                    <option value="Pequena">Small</option>
                    <option value="Media">Medium</option>
                    <option value="Grande">Large</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Price</Form.Label>
                  <Form.Control
                    type="number"
                    value={dose.price}
                    onChange={(e) =>
                      handleDoseChange(index, "price", e.target.value)
                    }
                    required
                  />
                </Form.Group>
                {index > 0 && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeDose(index)}
                  >
                    Remove Dose
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="secondary"
              size="sm"
              onClick={addDose}
              className="mb-3"
            >
              Add Dose
            </Button>
            <Form.Group className="mb-3">
              <Form.Label>Add an Image</Form.Label>
              <Form.Control
                type="file"
                onChange={handleImageUpload}
                accept="image/*"
              />
              {imageUploading && <p>Uploading image...</p>}
              {imageError && (
                <p className="text-danger">
                  Error uploading image. Please try again.
                </p>
              )}
              {plateForm.images && (
                <img
                  src={plateForm.images || "/placeholder.svg"}
                  alt="Plate"
                  className="mt-2"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={plateForm.description}
                onChange={handlePlateFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nutritional Value</Form.Label>
              <Form.Control
                as="textarea"
                name="nutritionalValue"
                value={plateForm.nutritionalValue}
                onChange={handlePlateFormChange}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              {editingPlate ? "Update Plate" : "Add Plate"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default RestaurantDashboard;

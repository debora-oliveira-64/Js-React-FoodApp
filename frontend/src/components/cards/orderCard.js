import React from "react";
import { Card, Button } from "react-bootstrap";

export const OrderCard = ({ order }) => {
  return (
    <Card className="mb-4">
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <span
            className={`badge ${
              order.status === "expedida"
                ? "bg-success text-white"
                : "bg-secondary text-white"
            }`}
          >
            {order.status === "expedida" ? "Active" : "Delivered"}
          </span>
        </div>
      </Card.Header>
      <Card.Body>
        <p className="text-muted mb-2">
          <strong>Date:</strong> {new Date(order.date).toLocaleDateString()}
        </p>
        <p className="text-muted mb-2">
          <strong>Total Price:</strong> ${order.totalPrice.toFixed(2)}
        </p>
        <div>
          <strong>Plates:</strong>
          <ul className="list-unstyled mt-2">
            {order.plates.map((plate, index) => (
              <li key={index} className="text-muted">
                <span>{plate.plate.name}</span>
                <span className="mx-2">|</span>
                <span>Dose: {plate.dose}</span>
                <span className="mx-2">|</span>
                <span>Price: ${plate.price.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card.Body>
    </Card>
  );
};

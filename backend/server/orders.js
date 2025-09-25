const express = require("express")
const Users = require("../data/users")
const scopes = require("../data/users/scopes")
const VerifyToken = require("../middleware/token")
const cookieParser = require("cookie-parser")
const Order = require("../data/orders")
const { getIO } = require("./socketManager")

const OrderRouter = () => {
  const router = express.Router()

  router.use(express.json({ limit: "100mb" }))
  router.use(express.urlencoded({ limit: "100mb", extended: true }))
  router.use(cookieParser())
  router.use(VerifyToken)

  router.route("/").post(Users.autorize([scopes.Client]), async (req, res) => {
    try {
      const body = req.body

      const order = await Order.create(body)
      console.log("Created order!")

      console.log(body.plates)

      if (body.plates && Array.isArray(body.plates)) {
        const restaurantIds = body.plates.map((plate) => plate.restaurant)

        const io = getIO()

        restaurantIds.forEach((restaurantId) => {
          if (restaurantId) {
            console.log("restaurant notification sent")
            io.to(restaurantId.toString()).emit("new-order", {
              message: "You have a new order!",
              orderDetails: order,
            })
          }
        })
      }

      res.status(200).json(order)
    } catch (err) {
      console.log("Order creation failed!")
      console.error(err)
      res.status(500).json({ message: err.message })
    }
  })
    .get(function (req, res, next) {
      console.log("get all orders data");
      Order.findAll()
        .then((orders) => {
          res.send(orders);
          next();
        })
        .catch((err) => {
          next();
        });
    });

  router
    .route("/client/:userId")
    .get(
      Users.autorize([scopes.Admin, scopes.Client]),
      function (req, res, next) {
        const userId = req.params.userId;
        const { limit, skip } = req.query;
        console.log("orders per client");

        Order.findOrdersByUser(userId, {
          limit: parseInt(limit) || 10,
          skip: parseInt(skip) || 0,
        })
          .then((result) => {
            res.status(200).send(result);
            console.log(result.data)
            next();
          })
          .catch((err) => {
            console.error("Error finding orders by user:", err.message);
            res.status(500).send({ error: err.message });
            next();
          });
      }
    );

  router
    .route("/restaurant/:restaurantId")
    .get(
      Users.autorize([scopes.Admin, scopes.Restaurant]),
      function (req, res, next) {
        console.log("get orders by restaurant")
        const restaurantId = req.params.restaurantId;
        const { limit, skip } = req.query;

        Order.findOrdersByRestaurant(restaurantId, {
          limit: parseInt(limit) || 10,
          skip: parseInt(skip) || 0,
        })
          .then((result) => {
            console.log(result.data)
            res.status(200).send(result);
            next();
          })
          .catch((err) => {
            console.error("Error finding orders by restaurant:", err.message);
            res.status(500).send({ error: err.message });
            next();
          });
      }
    );

  router
    .route("/:orderId")
    .get(
      Users.autorize([scopes.Admin, scopes.Restaurant, scopes.Order]),
      function (req, res, next) {
        console.log("get a order by id");
        let id = req.params.orderId;
        Order.findUserById(id)
          .then((order) => {
            res.status(200);
            res.send(order);
            next();
          })
          .catch((err) => {
            res.status(404);
            next();
          });
      }
    )
    .patch(Users.autorize([scopes.Admin, scopes.Restaurant]), async function (req, res, next) {
      console.log("Updating order by ID");
      const id = req.params.orderId;
      const updateData = req.body;
      console.log(id)

      try {
        if (!id || Object.keys(updateData).length === 0) {
          return res
            .status(400)
            .json({
              error: "Invalid input. order ID and update data are required.",
            });
        }

        const updatedOrder = await Order.update(id, updateData);

        if (!updatedOrder) {
          return res.status(404).json({ error: "order not found" });
        }

        const io = getIO(); 
      const userId = updatedOrder.user;
      io.to(userId.toString()).emit("order-updated", {
        message: "Your order has been updated!",
        orderDetails: updatedOrder,
      });

        res.status(200).json(updatedOrder);
      } catch (err) {
        console.error("Error updating Order:", err);

        if (err.name === "ValidationError") {
          return res
            .status(422)
            .json({ error: "Invalid data provided", details: err.errors });
        }

        if (err.name === "CastError") {
          return res.status(400).json({ error: "Invalid order ID format" });
        }

        res
          .status(500)
          .json({
            error: "Internal server error occurred while updating order",
          });
      }
    });

  return router;
};

module.exports = OrderRouter;

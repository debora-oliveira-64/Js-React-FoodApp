const bodyParser = require("body-parser");
const express = require("express");
const Users = require("../data/users");
const scopes = require("../data/users/scopes");
const VerifyToken = require("../middleware/token");
const cookieParser = require("cookie-parser");
const Restaurant = require("../data/restaurants");
const { route } = require("express/lib/router");

const RestaurantRouter = () => {
  let router = express();

  router.use(bodyParser.json({ limit: "100mb" }));
  router.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));


  router.route("/").get(function (req, res, next) {
    console.log("get all restaurants data");
    Restaurant.findAll()
      .then((data) => {
        res.send(data);
        next();
      })
      .catch((err) => {
        next();
      });
  });

  router.use(cookieParser());
  router.use(VerifyToken);

  router
    .route("/")
    .post(function (req, res, next) {
      let body = req.body;

      Restaurant.create(body)
        .then((data) => {
          console.log("Created!");
          console.log(data)
          res.status(200).send(data);
          next();
        })
        .catch((err) => {
          console.log("restaurant already exists!");
          console.log(err.message);
          err.status = err.status || 500;
          res.status(401);
          next();
        });
    });

  router
    .route("/:restaurantId")
    .get(
      Users.autorize([scopes.Admin, scopes.Restaurant, scopes.Client]),
      function (req, res, next) {
        console.log("get a restaurant by id");
        let id = req.params.restaurantId;
        Restaurant.findRestaurantById(id)
          .then((data) => {
            res.status(200);
            res.send(data);
            next();
          })
          .catch((err) => {
            res.status(404);
            next();
          });
      }
    )
    .delete(Users.autorize([scopes.Admin]), function (req, res, next) {
      console.log("delete a restaurant by id");
      let id = req.params.restaurantId;
      let body = req.body;

      Restaurant.update(id, body)
        .then((data) => {
          res.status(200);
          res.send(data);
          next();
        })
        .catch((err) => {
          res.status(404);
          next();
        });
    })
    .patch(
      Users.autorize([scopes.Admin, scopes.Restaurant]),
      async function (req, res, next) {
        console.log("Updating restaurant by ID");
        const id = req.params.restaurantId;
        const updateData = req.body;

        console.log(updateData);

        try {
          const updatedRestaurant = await Restaurant.update(id, updateData);
          res.status(200).json(updatedRestaurant);
        } catch (err) {
          console.error("Error updating restaurant:", err);
          res.status(500);
        }
      }
    );

    

  return router;
};

module.exports = RestaurantRouter;

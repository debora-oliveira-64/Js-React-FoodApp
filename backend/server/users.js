const bodyParser = require("body-parser");
const express = require("express");
const Users = require("../data/users");
const scopes = require("../data/users/scopes");
const VerifyToken = require("../middleware/token");
const cookieParser = require("cookie-parser");

const UsersRouter = () => {
  let router = express();

  router.use(bodyParser.json({ limit: "100mb" }));
  router.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

  router.use(cookieParser());
  router.use(VerifyToken);

  router
    .route("")
    .post(Users.autorize([scopes.Admin]), function (req, res, next) {
      let body = req.body;
      console.log("Create user");
      Users.create(body)
        .then((user) => {
          res.status(200);
          res.send();
          next();
        })
        .catch((err) => {
          console.log("erro", err);
          res.status(404);
          next();
        });
    })
    .get(
      Users.autorize([scopes.Admin]),
      function (req, res, next) {
        console.log("get all users");

        const pageLimit = req.query.limit ? parseInt(req.query.limit) : 5;
        const pageSkip = req.query.skip
          ? pageLimit * parseInt(req.query.skip)
          : 0;

        req.pagination = {
          limit: pageLimit,
          skip: pageSkip,
        };

        Users.findAll(req.pagination)
          .then((users) => {
            const response = {
              auth: true,
              ...users,
            };
            res.send(response);
            next();
          })
          .catch((err) => {
            console.log(err.message);
            next();
          });
      }
    );

  router
    .route("/:userId")
    .get(Users.autorize([scopes.Admin, scopes.Restaurant, scopes.Client]), function (req, res, next) {
      console.log("Get a user by ID");
      let userId = req.params.userId;
  
      Users.findUserById(userId)
        .then((user) => {
          if (!user) {
            res.status(404).send({ error: "User not found" });
            return next();
          }
          res.status(200).send(user);
          next();
        })
        .catch((err) => {
          console.error("Error fetching user:", err);
          res.status(500).send({ error: "Error fetching user" });
          next();
        });
    })
    .put(Users.autorize([scopes.Admin]), function (req, res, next) {
      console.log("update a user by id");
      let userId = req.params.userId;
      let body = req.body;

      Users.update(userId, body)
        .then((user) => {
          res.status(200);
          res.send(user);
          next();
        })
        .catch((err) => {
          res.status(404);
          next();
        });
    });

    router
    .route("/email/:email")
    .get(Users.autorize([scopes.Admin]), function (req, res, next) {
      console.log("Get user by email");
      const email = req.params.email;

      Users.findUserByEmail(email)
        .then((user) => {
          if (!user) {
            res.status(404).send({ error: "User not found" });
            return next();
          }
          res.status(200).send(user);
          next();
        })
        .catch((err) => {
          console.error("Error fetching user:", err);
          res.status(500).send({ error: "Error fetching user" });
          next();
        });
    });

  return router;
};

module.exports = UsersRouter;

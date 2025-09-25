const bodyParser = require("body-parser");
const express = require("express");
const Users = require("../data/users");
const scopes = require("../data/users/scopes");
const VerifyToken = require("../middleware/token");
const cookieParser = require("cookie-parser");
const Plate = require("../data/plates");

const PlateRouter = () => {
  let router = express();

  router.use(bodyParser.json({ limit: "100mb" }));
  router.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

  router.use(cookieParser());
  router.use(VerifyToken);

  router
    .route("/")
    .post(Users.autorize([scopes.Admin, scopes.Restaurant]), function (req, res, next) {
      let body = req.body;

      Plate.create(body)
        .then((data) => {
          console.log("Created!");
          res.status(200);
          res.send(data);
          next();
        })
        .catch((err) => {
          console.log("plate already exists!");
          console.log(err.message);
          err.status = err.status || 500;
          res.status(401);
          next();
        });
    })
    .get(function (req, res, next) {
          console.log("get all plates data");
          Plate.findAll()
            .then((data) => {
              res.send(data);
              next();
            })
            .catch((err) => {
              next();
            });
        }
      )

  router
    .route("/:plateId")
    .get(Users.autorize([scopes.Admin, scopes.Restaurant, scopes.Client]), function (req, res, next) {
      console.log("get a plate by id");
      let id = req.params.plateId;
      Plate.findPlateById(id)
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
    .delete(Users.autorize([scopes.Admin, scopes.Restaurant]), async function (req, res) {
      console.log("Attempting to delete a plate by ID...");
    
      const id = req.params.plateId;
    
      try {
        const result = await Plate.removeById(id);e
    
        if (!result) {
          return res.status(404).json({ message: "Plate not found" });
        }

        return res.status(200).json({ message: "Plate deleted successfully" });
        
      } catch (err) {
        return res.status(500).json({ message: "Internal server error", error: err.message });
      }
    })    
    .patch(
      Users.autorize([scopes.Admin, scopes.Restaurant]),
      async function (req, res, next) {
        console.log("Updating plate by ID");
        const id = req.params.plateId;
        const updateData = req.body;

        try {
          const updated = await Plate.update(id, updateData);
          res.status(200).json(updated);
        } catch (err) {
          console.error("Error updating restaurant:", err);
          res.status(500);
        }
      }
    );


  return router;
};

module.exports = PlateRouter;
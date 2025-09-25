const bodyParser = require("body-parser");
const express = require("express");
const Users = require("../data/users");
const cookieParser = require('cookie-parser');
const VerifyToken = require('../middleware/token');
const scopes = require('../data/users/scopes')

function AuthRouter() {
  let router = express();

  router.use(bodyParser.json({ limit: "100mb" }));
  router.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

  router.route("/register").post(async function (req, res, next) {
    const body = req.body;
    try {
      const newUser = await Users.create(body); 
      const tokenResponse = await Users.createToken(newUser.user);
  
      res.status(200).send(tokenResponse);
    } catch (err) {
      console.error("Error during registration:", err.message);
      res.status(500).send({ message: "Registration failed", error: err.message });
      next(err);
    }
  });
  

  router.route("/login").post(function (req, res, next) {
    let body = req.body;

    return Users.findUser(body)
      .then((user) => {
        return Users.createToken(user);
      })
      .then((response) => {
        console.log('response', response)
        res.cookie("token", response.token, { httpOnly: true });
        res.status(200);
        res.send(response);
      })
      .catch((err) => {
        console.log('error', err);
        res.status(500);
        res.send(err);
      });
  });

  router.use(cookieParser()); 
  router.use(VerifyToken); 

  router.route("/logout").get(function (req, res, next) {
    res.cookie("token", req.cookies.token, { httpOnly: true, maxAge: 0 });

    res.status(200);
    res.send({ logout: true });
    next();
  });

  router.route("/me").get(function(req, res, next)  {
    return new Promise(() => {
      res.status(202).send({ auth:true, decoded: req.roleUser, userId: req.id });
    })
    .catch((err) => {
      res.status(500);
      res.send(err);
      next();
    });
  });

  return router;
}

module.exports = AuthRouter;

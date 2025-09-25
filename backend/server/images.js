const bodyParser = require("body-parser");
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

function ImageRouter() {
  let router = express();

  router.use(bodyParser.json({ limit: "100mb" }));
  router.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, "../images");

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
      }

      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + "-" + file.originalname;
      cb(null, uniqueName);
    },
  });

  const upload = multer({ storage });

  router.route("/upload").post(upload.single("image"), (req, res, next) => {

    console.log("upload an image");
    if (!req.file) {
      return res.status(400).send({ message: "No file uploaded" });
    }

    const imageUrl = `/images/${req.file.filename}`;
    const fileName = req.file.filename;

    return res.status(200).send({
      message: "Image uploaded successfully!",
      imageUrl: fileName,
    });
  });

  router.route("/image/:imageName").get((req, res) => {

    console.log("get an image");

    const imageName = req.params.imageName;

    const imagePath = path.join(__dirname, "../images", imageName);

    if (fs.existsSync(imagePath)) {
      res.sendFile(imagePath);
    } else {
      res.status(404).send({ message: "Image not found" });
    }
  });

  return router;
}

module.exports = ImageRouter;


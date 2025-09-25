const express = require("express")
const http = require("http")
const mongoose = require("mongoose")
const path = require("path")
const cors = require("cors")
const { initializeSocket } = require("./server/socketManager")
const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('./doc/api.json');

const config = require("./config")

const hostname = "127.0.0.1"
const port = 5000

mongoose
  .connect(config.db)
  .then(() => console.log("Connection successful!"))
  .catch((err) => console.error(err))

const app = express()

app.use(
  cors({
    origin: "http://localhost:3000", 
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  }),
)

app.use("/images", express.static(path.join(__dirname, "images")));
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))

const server = http.createServer(app)

const io = initializeSocket(server)

const router = require("./router")
app.use(router.init())

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}`)
  console.log(`Socket.IO server running on port ${port}`)
  console.log(`Swagger UI available at http://${hostname}:${port}/api-docs`)
})

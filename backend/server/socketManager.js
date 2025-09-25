const socketIo = require("socket.io")

let io

function initializeSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: "http://localhost:3000", 
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"], 
  })

  io.on("connection", (socket) => {
    console.log("A user connected")

    socket.on("join-restaurant-room", (restaurantId) => {
      socket.join(restaurantId)
      console.log(`Socket joined room: ${restaurantId}`)
    })

    socket.on("join-user-room", (userId) => {
        if (userId) {
          socket.join(userId.toString());
          console.log(`User ${userId} joined their personal room`);
        }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected")
    })
  })

  return io
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized!")
  }
  return io
}

module.exports = { initializeSocket, getIO }
import express from "express"
import cors from "cors"
import mongoose from "mongoose"

// CONSTANTS
let PORT = 80
let MONGO_PATH = "mongodb://172.31.91.101:27017/monday"
let PEER_HOST = "ludwigmonday.gg"
let PEER_PATH = "/api/gangbang"
let PEER_PORT = 80
let WEBSOCKET_PATH = "https://ludwigmonday.gg/api/stepbrother"
let ENDPOINT = "/api/spermbank"

if (process.env.NODE_ENV !== "production") {
  PORT = 5000
  MONGO_PATH = "mongodb://localhost:27017/codesdb"
  PEER_HOST = "localhost"
  PEER_PATH = "/peer"
  PEER_PORT = 7000
  WEBSOCKET_PATH = "http://localhost:4000"
  ENDPOINT = "/api/auth"
}

// SERVER
const app = express()
app.use(cors())

// DATABASE
mongoose.connect(MONGO_PATH, {
  useNewUrlParser: true,
})
const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error: "))
db.once("open", () => {
  console.log("DB Connected successfully")
})

// DB MODEL
const Room = mongoose.model("room", {
  name: { type: String },
  host: { type: String },
  player: { type: String },
})

// const Admin = mongoose.model(
//   "Admin",
//   {
//     username: { type: String },
//     password: { type: String },
//   },
//   "admin"
// )

// ENDPOINTS
app.get(ENDPOINT, (req, res) => {
  if (req.query.roomcode && req.query.userId) {
    Room.findOne({ player: req.query.roomcode })
      .then((data) => {
        if (data) {
          res.send(
            JSON.stringify({
              roomcode: data.name,
              userId: req.query.userId,
              type: "player",
              peerHost: PEER_HOST,
              peerPath: PEER_PATH,
              peerPort: PEER_PORT,
              socketURL: WEBSOCKET_PATH,
            })
          )
        } else {
          Room.findOne({ host: req.query.roomcode })
            .then((data) => {
              if (data) {
                res.send(
                  JSON.stringify({
                    roomcode: data.name,
                    userId: req.query.userId,
                    type: "host",
                    peerHost: PEER_HOST,
                    peerPath: PEER_PATH,
                    peerPort: PEER_PORT,
                    socketURL: WEBSOCKET_PATH,
                  })
                )
              }
            })
            .catch((err) => res.status(500).send({ message: err.message }))
        }
      })
      .catch((err) => res.status(500).send({ message: err.message }))
  }
})

// app.get("/api/admin", (req, res) => {
//   // return all rooms
//   if (req.body.content.username && req.body.content.password) {
//     Admin.findOne({
//       username: req.body.content.username,
//       password: req.body.content.password,
//     })
//       .then((data) => {
//         if (!data) {
//           return res.status(401).send("string")
//         }
//       })
//       .catch((err) => res.status(401).send("string"))
//   } else {
//     return res.status(401).send("string")
//   }

//   Room.find()
//     .then((rooms) => res.send(rooms))
//     .catch((err) =>
//       res.status(500).send({ message: err.message || "Error getting rooms" })
//     )
// })

// app.post("/api/admin", (req, res) => {
//   // handle creating rooms
//   if (!req.body.content) {
//     return res.status(400).send({
//       message: "content cannot be empty",
//     })
//   }

//   if (req.body.content.username && req.body.content.password) {
//     Admin.findOne({
//       username: req.body.content.username,
//       password: req.body.content.password,
//     })
//       .then((data) => {
//         if (!data) {
//           return res.status(401).send("string")
//         }
//       })
//       .catch((err) => res.status(401).send("string"))
//   } else {
//     return res.status(401).send("string")
//   }

//   const room = new Room({
//     name: req.body.content.name,
//     host: req.body.content.host,
//     player: req.body.content.player,
//   })
//   room
//     .save()
//     .then((data) => {
//       res.send(data)
//     })
//     .catch((err) => {
//       res
//         .status(500)
//         .send({ message: err.message || "error while creating room" })
//     })
// })

// app.delete("api/admin", (req, res) => {
//   // handle deleting rooms
//   if (req.body.content.username && req.body.content.password) {
//     Admin.findOne({
//       username: req.body.content.username,
//       password: req.body.content.password,
//     })
//       .then((data) => {
//         if (!data) {
//           return res.status(401).send("string")
//         }
//       })
//       .catch((err) => res.status(401).send("string"))
//   } else {
//     return res.status(401).send("string")
//   }

//   Room.findOne({ name: req.body.content.name })
//     .then((room) => {
//       if (!room) {
//         return res.status(404).send({ message: "Room not found" })
//       }
//     })
//     .catch((err) => {
//       if (err.kind === "ObjectId" || err.name === "NotFound") {
//         return res.status(404).send({ message: "Room not found" })
//       }
//       return res.status(500).send({ message: "Could not delete room" })
//     })
// })

// SERVER LISTEN
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})

import express from "express"
import cors from "cors"
import mongoose from "mongoose"

// CONSTANTS
const PORT = 5000

// SERVER
const app = express()
app.use(cors())

// DATABASE
mongoose.connect("mongodb://localhost:27017/codesdb", {
  useNewUrlParser: true,
})
const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error: "))
db.once("open", () => {
  console.log("DB Connected successfully")
})

// DB MODEL
const Room = mongoose.model(
  "Room",
  {
    name: { type: String },
    host: { type: String },
    player: { type: String },
  },
  "codes"
)

const Admin = mongoose.model(
  "Admin",
  {
    username: { type: String },
    password: { type: String },
  },
  "admin"
)

// ENDPOINTS
app.get("/api/auth", (req, res) => {
  if (req.query.roomcode && req.query.userId) {
    Room.findOne({ player: req.query.roomcode })
      .then((data) => {
        if (data) {
          res.send(
            JSON.stringify({
              roomcode: req.query.roomcode,
              userId: req.query.userId,
              type: "player",
            })
          )
        } else {
          Room.findOne({ host: req.query.roomcode })
            .then((data) => {
              if (data) {
                res.send(
                  JSON.stringify({
                    roomcode: req.query.roomcode,
                    userId: req.query.userId,
                    type: "host",
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

app.get("/api/admin", (req, res) => {
  // return all rooms
  if (req.body.content.username && req.body.content.password) {
    Admin.findOne({
      username: req.body.content.username,
      password: req.body.content.password,
    })
      .then((data) => {
        if (!data) {
          return res.status(401).send("string")
        }
      })
      .catch((err) => res.status(401).send("string"))
  } else {
    return res.status(401).send("string")
  }

  Room.find()
    .then((rooms) => res.send(rooms))
    .catch((err) =>
      res.status(500).send({ message: err.message || "Error getting rooms" })
    )
})

app.post("/api/admin", (req, res) => {
  // handle creating rooms
  if (!req.body.content) {
    return res.status(400).send({
      message: "content cannot be empty",
    })
  }

  if (req.body.content.username && req.body.content.password) {
    Admin.findOne({
      username: req.body.content.username,
      password: req.body.content.password,
    })
      .then((data) => {
        if (!data) {
          return res.status(401).send("string")
        }
      })
      .catch((err) => res.status(401).send("string"))
  } else {
    return res.status(401).send("string")
  }

  const room = new Room({
    name: req.body.content.name,
    host: req.body.content.host,
    player: req.body.content.player,
  })
  room
    .save()
    .then((data) => {
      res.send(data)
    })
    .catch((err) => {
      res
        .status(500)
        .send({ message: err.message || "error while creating room" })
    })
})

app.delete("api/admin", (req, res) => {
  // handle deleting rooms
  if (req.body.content.username && req.body.content.password) {
    Admin.findOne({
      username: req.body.content.username,
      password: req.body.content.password,
    })
      .then((data) => {
        if (!data) {
          return res.status(401).send("string")
        }
      })
      .catch((err) => res.status(401).send("string"))
  } else {
    return res.status(401).send("string")
  }

  Room.findOne({ name: req.body.content.name })
    .then((room) => {
      if (!room) {
        return res.status(404).send({ message: "Room not found" })
      }
    })
    .catch((err) => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({ message: "Room not found" })
      }
      return res.status(500).send({ message: "Could not delete room" })
    })
})

// SERVER LISTEN
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})

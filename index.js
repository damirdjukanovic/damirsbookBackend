const express = require("express");
const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");
const dotenv = require("dotenv");
const helmet = require("helmet");
const usersRoute = require("./routes/users.js");
const authRoute = require("./routes/auth.js");
const postsRoute = require("./routes/posts.js");
const commentsRoute = require("./routes/comments.js");
const conversationRoute = require("./routes/conversations");
const messageRoute = require("./routes/messages");
const multer = require("multer");
const path = require("path");
const socketio = require('socket.io');
const cors = require('cors');

dotenv.config();

mongoose.connect(process.env.MONGO_URL,
  {useNewUrlParser: true, useUnifiedTopology: true}, () => {
  console.log("Connected to DB");
});


const server = http.createServer(app);
const io = socketio(server);

//middlewares

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("File uploded successfully");
  } catch (error) {
    console.error(error);
  }
});

app.use(cors());

app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

app.use("/api/users", usersRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postsRoute);
app.use("/api/comments", commentsRoute);
app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoute);


let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};



io.on("connection", (socket) => {
  //when ceonnect
  console.log("a user connected.");

  //take userId and socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });


  //send and get message
  socket.on("sendMessage", ({ senderId, receiverId, text, fullname }) => {
    const user = getUser(receiverId);
    read = false;
    if(user) {
    io.to(user.socketId).emit("getMessage", {
      senderId,
      text,
      fullname
    });}
  });

  //follow notification
  socket.on("follow", ({fullname, receiverId, createdAt, username}) => {
    const user = getUser(receiverId);
    console.log("follow fired", fullname);
    if(user) {
      io.to(user.socketId).emit("getNotification", {
        fullname,
        username,
        createdAt
      })
    }
  })

  //when disconnect
  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

app.listen(8000, () => console.log("Backend server running"));
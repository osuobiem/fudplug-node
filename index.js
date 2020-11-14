"use strict";

// Require and configure *dotenv* for environment variables
require("dotenv").config();

// Require useful modules
const app = require("express")();
const http = require("http").createServer(app);
const bodyParser = require("body-parser");
const request = require("request");

// Require in-app modules
const Socket = require("./lib/socket");

app.use(bodyParser.json());

// Set app PORT
const PORT = process.env.PORT || 3000;

// Connect to socket
let socket = new Socket(http);
socket.connect((io) => {
  // Send request to save new socket id
  io.socket.on("save-id", (username) => {
    request.get(
      {
        url: `${process.env.MAIN_SERVER}/socket/save-id/${username}/${io.socket.id}`,
      },
      (err, res, body) => {
        if (err) {
          console.log(err);
        }

        console.log(body);
      }
    );
  });

  // Socket Routes

  // Likes Count Endpoint
  app.post("/send-likes-count", (req, res) => {
    io.socket.broadcast.emit("like-count", {
      postId: req.body.post_id,
      likesCount: req.body.likes_count,
    });

    res.send();
  });

  // New Post Count
  app.post("/send-new-post", (req, res) => {
    io.socket.broadcast.emit("new-post", {
      markup: req.body.post_markup,
    });

    res.send();
  });
});

// Start application server
http.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

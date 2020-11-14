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
let io = new Socket(http);
io.connect((sock) => {
  // Send request to save new socket id
  sock.socket.on("save-id", (username) => {
    request.get(
      {
        url: `${process.env.MAIN_SERVER}/socket/save-id/${username}/${sock.socket.id}`,
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
  app.post("/send-likes-count", (req, res) => {
    sock.socket.broadcast.emit("like-count", {
      postId: req.body.post_id,
      likesCount: req.body.likes_count,
    });

    res.send();
  });
});

// Start application server
http.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

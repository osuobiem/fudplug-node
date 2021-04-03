"use strict";

// Require and configure *dotenv* for environment variables
require("dotenv").config();

// Require useful modules
const app = require("express")();
const http = require("http").createServer(app);
const bodyParser = require("body-parser");
const request = require("request");
const cors = require('cors')

// Require in-app modules
const Socket = require("./lib/socket");
const WebPush = require("./lib/webpush.js");

app.use(cors())
app.use(bodyParser.json());

// Set app PORT
const PORT = process.env.PORT || 3000;

// Webpush
let webpush = new WebPush();

/** Webpush Routes */

// Send VAPID Public key
app.get("/sw/get-pvk", (req, res) => {
  res.send(process.env.VAPID_PUBLIC_KEY);
})

// Send Push Notification
app.post("/sw/send-notification", (req, res) => {
  const subscription = req.body.subscription;
  const payload = req.body.payload;
  const options = {
    TTL: req.body.ttl
  };

  setTimeout(() => {
    webpush.send(subscription, payload, options, res)
  }, 3000)
})

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

  /** Socket Routes */

  // Likes Count Endpoint
  app.post("/send-likes-count", (req, res) => {
    io.socket.broadcast.emit("like-count", {
      postId: req.body.post_id,
      likesCount: req.body.likes_count,
      area: req.body.area,
    });

    res.send();
  });

  // New Post Count
  app.post("/send-new-post", (req, res) => {
    io.socket.broadcast.emit("new-post", {
      markup: req.body.post_markup,
      area: req.body.area,
    });

    res.send();
  });

  // Comments Count Endpoint
  app.post("/send-comments-count", (req, res) => {
    let newComment = req.body.new_comment ? req.body.new_comment : '';
    io.socket.broadcast.emit("comment-count", {
      postId: req.body.post_id,
      commentsCount: req.body.comments_count,
      area: req.body.area,
      newComment
    });

    res.send();
  });

  // New Comment Endpoint
  app.post("/send-new-comment", (req, res) => {
    io.socket.broadcast.emit("new-comment", {
      newComment: req.body.new_comment,
      postId: req.body.post_id,
      commentor: req.body.commentor_socket,
      area: req.body.area
    });

    res.send();
  });

  // Delete Comment Endpoint
  app.post("/delete-comment", (req, res) => {
    io.socket.broadcast.emit("delete-comment", {
      commentId: req.body.comment_id,
      postId: req.body.post_id,
      commentor: req.body.commentor_socket,
      area: req.body.area
    });

    res.send();
  });

  // Send Notification Endpoint
  app.post("/notify", (req, res) => {
    io.socket.broadcast.emit("notify", {
      owner: req.body.owner_socket,
      content: req.body.content,
      content_nmu: req.body.content_nmu
    });

    res.send();
  });

  // Delete Post Endpoint
  app.post("/delete-post", (req, res) => {
    io.socket.broadcast.emit("delete-post", {
      postId: req.body.post_id
    });

    res.send();
  });
});

// Start application server
if(process.env.NODE_ENV == 'development') {
  http.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
}
else {
  http.listen();
}

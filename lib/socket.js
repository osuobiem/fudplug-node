"use strict";

// Require and configure *dotenv* for environment variables
require("dotenv").config();

class Socket {
  // Member variables
  io;
  connected = {};

  /**
   * Require socket.io module
   *
   * @param object server - http server object
   */
  constructor(server) {
    this.io = require("socket.io")(server, {
      cors: {
        origin: "http://127.0.0.1:8000",
        methods: ["GET", "POST"],
      },
    });
  }

  /**
   * Establish socket connection
   *
   * @param function callback - Callback function that grants access to socket object
   */
  connect(callback) {
    this.io.on("connection", (socket) => {
      console.log(`Socket connection established`);

      callback({ socket, io: this.io });
    });
  }
}

module.exports = Socket;

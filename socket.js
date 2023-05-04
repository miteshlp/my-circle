const socket = require("socket.io");

module.exports = function (server) {
    const io = socket(server);
    io.on("connection", function (socket) {
        console.log("Made socket connection");
    });

    // io.on("connection", function (socket) {
    //     console.log("Made socket connection");
    // });
}


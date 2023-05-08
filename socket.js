
module.exports = function (server,) {
    global.io = require("socket.io")(server, {
        cors: {
            origin: '*',
        }
    });
    // server.listen(3002);

    io.on("connection", async function (socket) {
        console.log("Made socket connection");
        global.ioSocket = socket; 
        socket.join(socket.handshake.query.userId);
    });
}


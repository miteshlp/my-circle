module.exports = function (server) {
    global.io = require("socket.io")(server, {
        cors: {
            origin: '*',
        }
    });
    // server.listen(3002);

    io.on("connection", async function (socket) {
        console.log("Socket connection successfull !");
        const userId = socket.handshake.query.userId;
        // console.log(io.sockets.adapter.rooms);
        // join socket.id to specific user room , room name is _id of user
        socket.join(userId);

        // get count of request from database and send to client for request notification count
        socket.on("getRequestCount", async (userId) => {
            const requestCount = await db.models.follower.find({ userId: userId, status: "requested" }).count();
            socket.emit("totalRequests", requestCount);
        });

        socket.on("updateNotification", async (notifyId) => {
            await db.models.notification.updateOne({ _id: new ObjectId(notifyId) }, { $set: { isSeen: true } });
        });

        socket.on("join-room", (roomId, userId) => {
            socket.join(roomId);
            socket.to(roomId).emit("user-connected", userId);

            socket.on("message", (message) => {
                io.to(roomId).emit("createMessage", message);
            });
            socket.on("call-disconnect", (data) => {
                if (io.sockets.adapter.rooms.get(data.roomId)?.size == 1) {
                    io.to(data.receiver).emit("missed-call");
                }
                io.to(data.roomId).emit("call-disconnect");
                io.socketsLeave(data.roomId);
            });
        });
    });
}
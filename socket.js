module.exports = function (server) {
    global.io = require("socket.io")(server, {
        cors: {
            origin: '*',
        }
    });
    // server.listen(3002);

    io.on("connection", async function (socket) {
        console.log("Socket connection successfull !");
        const userId = socket.handshake.query.userId

        // join socket.id to specific user room , room name is _id of user
        socket.join(userId);

        // get count of request from database and send to client for request notification count
        socket.on("getRequestCount", async (userId) => {
            const requestCount = await db.models.follower.find({ userId: userId, status: "requested" }).count();
            socket.emit("totalRequests", requestCount);
        });

        socket.on("updateNotification", async (notifyId) => {
            await db.models.notification.updateOne({ _id:new ObjectId(notifyId)}, { $set: { isSeen: true } });
        })
    });
}


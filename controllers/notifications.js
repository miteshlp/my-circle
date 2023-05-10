module.exports = {
    getNotifications: async function (userId) {
        const allNotifications = await db.models.notification.aggregate([
            {
                $match: { receiverId: new ObjectId(userId) }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "notifireId",
                    foreignField: "_id",
                    pipeline: [{
                        $project: { name: 1, path: 1}
                    }],
                    as: "notifire"
                }
            },
            {
                $project: {notifire: { $arrayElemAt: ["$notifire", 0] },createdOn :1 , postId :1, message :1 ,isSeen:1}
            },
            {
                $sort : {createdOn : -1}
            }
        ]);
        return allNotifications;
    },
    getUnseen: async function (userId) {
        const unSeen = await db.models.notification.aggregate([
            {
                $match: { receiverId: new ObjectId(userId) , isSeen : false  }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "notifireId",
                    foreignField: "_id",
                    pipeline: [{
                        $project: { name: 1, path: 1}
                    }],
                    as: "notifire"
                }
            },
            {
                $project: {notifire: { $arrayElemAt: ["$notifire", 0] },createdOn :1 , postId :1, message :1 ,isSeen:1}
            },
            {
                $sort : {createdOn : -1}
            },
            {
                $limit : 5
            }
        ]);
        return unSeen;
    }
} 

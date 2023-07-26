module.exports = {
    getChatUsers: async function (userId) {
        try {
            // const allUsers = await db.models.user.find({ _id: { $ne: userId } }, { _id: 1, name: "$name.full", path: 1 }).lean();
            const allUsers = await db.models.user.aggregate([
                { $match: { _id: { $ne: new ObjectId(userId) } } },
                {
                    $lookup: {
                        from: "chats",
                        let: {
                            chatPartner: "$_id",
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $or: [{
                                            $and: [
                                                {
                                                    $eq: [
                                                        "$receiverId",
                                                        "$$chatPartner"
                                                    ]
                                                },
                                                {
                                                    $eq: [
                                                        "$senderId",
                                                        new ObjectId(userId)
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            $and: [
                                                {
                                                    $eq: [
                                                        "$senderId",
                                                        "$$chatPartner"
                                                    ]
                                                },
                                                {
                                                    $eq: [
                                                        "$receiverId",
                                                        new ObjectId(userId)
                                                    ]
                                                }
                                            ]
                                        }]

                                    }
                                }
                            },
                        ],
                        as: "allMessages"
                    }
                },
                {
                    $project: {
                        unseenMessages: {
                            $size: {
                                $filter: {
                                    input: '$allMessages',
                                    as: 'message',
                                    cond: { $and: [{ $eq: ['$$message.isSeen', false] }, { $ne: ['$$message.senderId', new ObjectId(userId) ] }] }
                                }
                            }
                        }, lastMessage: { $arrayElemAt: ['$allMessages', -1] }, path: 1, name: "$name.full", createdOn: 1
                    }
                },
                {
                    $sort: { "lastMessage._id": -1 }
                }
            ]);
            return allUsers;
        } catch (error) {
            console.log(`error :>> `, error);
        }
    },
    getChats: async function (currentUser, otherUser) {
        try {
            const chat = await db.models.chat.find({
                $or: [{
                    $and: [{ receiverId: currentUser }, { senderId: otherUser }]
                },
                {
                    $and: [{ receiverId: otherUser }, { senderId: currentUser }]
                }]
            }).lean();
            await db.models.chat.updateMany({
                $and: [{ receiverId: currentUser }, { senderId: otherUser }]
            }, {
                isSeen: true
            });
            return chat;
        } catch (error) {
            console.log(`error :>> `, error);
        }
    },
    getUnseen: async function (userId) {
        const unSeen = await db.models.notification.aggregate([
            {
                $match: { receiverId: new ObjectId(userId), isSeen: false }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "notifireId",
                    foreignField: "_id",
                    pipeline: [{
                        $project: { name: 1, path: 1 }
                    }],
                    as: "notifire"
                }
            },
            {
                $project: { notifire: { $arrayElemAt: ["$notifire", 0] }, createdOn: 1, postId: 1, message: 1, isSeen: 1 }
            },
            {
                $sort: { createdOn: -1 }
            },
            {
                $limit: 5
            }
        ]);
        return unSeen;
    }
} 

module.exports = {
    getFollowers: async (userId) => {
        console.log("in follow controller");
        const followers = await db.models.follower.aggregate([
            {
                $match: { userId: new ObjectId(userId), status: "following" }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "followerId",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $lookup: {
                                from: "followers",
                                let: {
                                    followeId: "$_id",
                                },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    {
                                                        $eq: [
                                                            "$userId",
                                                            "$$followeId"
                                                        ]
                                                    },
                                                    {
                                                        $eq: [
                                                            "$followerId",
                                                            new ObjectId(userId)
                                                        ]
                                                    }
                                                ]
                                            }
                                        }
                                    },
                                ],
                                as: "isFollowing"
                            }
                        },
                        // {
                        //     $project: { isFollowing: { $size: "$isFollowing" }, name: 1 ,path: 1, createdOn: 1}
                        // }
                    ],
                    as: "followerDetails"
                }
            },
            {
                $sort: { createdOn: -1 }
            },
            {
                $project: {follower: { $arrayElemAt: ["$followerDetails", 0] }, createdOn: 1, status: 1}
            }
        ]);
        console.log(followers);
        return followers;
    },
    getFollowing: async (userId) => {
        console.log("in follow controller");
        const following = await db.models.follower.aggregate([
            {
                $match: { followerId: new ObjectId(userId), status: "following" }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "followerDetails"
                }
            },
            {
                $sort: { createdOn: -1 }
            },
            {
                $project: { follower: { $arrayElemAt: ["$followerDetails", 0] }, createdOn: 1, status: 1 }
            }
        ]);
        return following;
    }
}
module.exports = {
    getFollowCount: async (userId) => {
        const followCount = {
            followers: await db.models.follower.find({ userId: new ObjectId(userId), status: "following" }).count(),
            following: await db.models.follower.find({ followerId: new ObjectId(userId), status: "following" }).count(),
        }
        return followCount;
    },
    // list of users
    get: async (query, user, isXhr, page, limit) => {
        const condition = { isDeleted: false, _id: { $ne: new ObjectId(user._id) } };
        const regex = query.search;
        const skip = (page - 1) * limit;
        if (isXhr) {
            if (regex != "empty") {
                condition["$or"] = [{ email: { $regex: regex, $options: 'i' } }, { "name.full": { $regex: regex, $options: 'i' } }]
            }
        }
        const userList = await db.models.user.aggregate([
            {
                $match: condition
            },
            {
                $lookup: {
                    from: "posts",
                    localField: "_id",
                    foreignField: "postby",
                    pipeline: [{ $match: { isDeleted: false } }],
                    as: "TotalPosts"
                }
            },
            {
                $lookup: {
                    from: "saved_posts",
                    localField: "_id",
                    foreignField: "user",
                    as: "TotalSaved"
                }
            },
            {
                $lookup: {
                    from: "followers",
                    let: {
                        user: "$_id",
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: [
                                                "$followerId",
                                                new ObjectId(user._id)
                                            ]
                                        },
                                        {
                                            $eq: [
                                                "$userId",
                                                "$$user"
                                            ]
                                        }
                                    ]
                                }
                            }
                        }, {
                            $project: { status: 1 }
                        }
                    ],
                    as: "isFollowed"
                }
            },
            {
                $project: { isFollowed: { $arrayElemAt: ["$isFollowed", 0] }, savedPosts: { $size: "$TotalSaved" }, posts: { $size: "$TotalPosts" }, name: 1, eamil: 1, path: 1, createdOn: 1, account_privacy: 1 }
            },
            {
                $sort: { createdOn: -1 }
            },
            { "$skip": skip },
            { "$limit": limit }
        ]);
        // user count for pagination
        const userCount = await db.models.user.aggregate([
            {
                $match: condition
            },
            {
                $lookup: {
                    from: "posts",
                    localField: "_id",
                    foreignField: "postby",
                    pipeline: [{ $match: { isDeleted: false } }],
                    as: "TotalPosts"
                }
            },
            {
                $lookup: {
                    from: "saved_posts",
                    localField: "_id",
                    foreignField: "user",
                    as: "TotalSaved"
                }
            },
            {
                $lookup: {
                    from: "followers",
                    let: {
                        user: "$_id",
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: [
                                                "$followerId",
                                                new ObjectId(user._id)
                                            ]
                                        },
                                        {
                                            $eq: [
                                                "$userId",
                                                "$$user"
                                            ]
                                        }
                                    ]
                                }
                            }
                        }, {
                            $project: { status: 1 }
                        }
                    ],
                    as: "isFollowed"
                }
            },
            {
                $project: { isFollowed: { $arrayElemAt: ["$isFollowed", 0] }, savedPosts: { $size: "$TotalSaved" }, posts: { $size: "$TotalPosts" }, name: 1, eamil: 1, path: 1, createdOn: 1, account_privacy: 1 }
            },
            {
                $count: "totalUser"
            }

        ]);
        const total = userCount[0]?.totalUser
        let to, fromTo;
        if (page * limit > total) {
            to = total;
        }
        else {
            to = page * limit;
        }
        if ((skip + 1) == to) {
            fromTo = to + "th"
        }
        else {
            fromTo = skip + 1 + " to " + to
        }
        return {
            userList: userList,
            userCount: total,
            fromTo: fromTo
        };
    },
    userProfile: async (userId, currentUser) => {
        const userProfile = await db.models.user.aggregate([
            {
                $match: { _id: new ObjectId(userId) }
            },
            {
                $lookup: {
                    from: "posts",
                    localField: "_id",
                    foreignField: "postby",
                    pipeline: [{ $match: { isDeleted: false } }, {
                        $lookup: {
                            from: "liked_posts",
                            localField: "_id",
                            foreignField: "post",
                            as: "total"
                        }
                    },
                    {
                        $lookup: {
                            from: "liked_posts",
                            let: {
                                postId: "$_id",
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                {
                                                    $eq: [
                                                        "$user",
                                                        new ObjectId(currentUser)
                                                    ]
                                                },
                                                {
                                                    $eq: [
                                                        "$post",
                                                        "$$postId"
                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                }
                            ],
                            as: "isLiked"
                        }
                    },
                    {
                        $project: {
                            likes: { $size: "$total" },
                            postby: 1,
                            title: 1,
                            description: 1,
                            path: 1,
                            createdOn: 1,
                            isLiked: { $size: "$isLiked" }
                        }
                    }],
                    as: "TotalPosts"
                }
            },
            {
                $lookup: {
                    from: "followers",
                    let: {
                        user: "$_id",
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: [
                                                "$followerId",
                                                new ObjectId(currentUser)
                                            ]
                                        },
                                        {
                                            $eq: [
                                                "$userId",
                                                "$$user"
                                            ]
                                        }
                                    ]
                                }
                            }
                        }, {
                            $project: { status: 1 }
                        }
                    ],
                    as: "isFollowed"
                }
            },
            {
                $project: {
                    allPosts: "$TotalPosts", isFollowed: { $arrayElemAt: ["$isFollowed", 0] }, posts: { $size: "$TotalPosts" }, name: 1, eamil: 1, path: 1, createdOn: 1, account_privacy: 1
                    ,isVisible : { $or: [{ $eq: ["$account_privacy", "public"] },{ $eq: ["$isFollowed.status", "following"] }] }
                }
            },
        ]);
        return userProfile;
    }
}
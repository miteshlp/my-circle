module.exports = {
    getPosts: async function (query, user, isXhr, page) {
        const condition = { isDeleted: false };
        const regex = query.search;
        const skip = (page - 1) * 6;
        const sort = { createdOn: -1 };
        if (isXhr) {
            delete sort.createdOn;
            if (query.filter == "Mine") condition.postby = new ObjectId(user?._id);
            if (query.filter == "Others") condition.postby = { $ne: new ObjectId(user?._id) };
            if (query.sort == "Title") sort.title = 1;
            else if (query.sort == "Populer") sort.likes = -1;
            else sort.createdOn = -1;
            if (regex != "empty") {
                condition["$or"] = [{ title: { $regex: regex, $options: 'i' } }, { description: { $regex: regex, $options: 'i' } }]
            }
        }
        const followingUsers = await db.models.follower.find({followerId : new ObjectId(user?._id) , status : "following"} , {userId : 1 , _id :0});
        const userIds = followingUsers.map(function(x) { return x.userId } );
        const posts = await db.models.post.aggregate([
            {
                $match: condition
            },

            {
                $lookup: {
                    from: "users",
                    localField: "postby",
                    foreignField: "_id",
                    pipeline: [
                        // {
                        //     $project: { name: 1, path: 1 }
                        // }
                    ],
                    as: "postUser"
                }
            },
            {
                $lookup: {
                    from: "saved_posts",
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
                                                new ObjectId(user?._id)
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
                    as: "isSaved"
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
                                                new ObjectId(user?._id)
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
                $lookup: {
                    from: "liked_posts",
                    localField: "_id",
                    foreignField: "post",
                    as: "total"
                }
            },
            {
                $project: {
                    savedPosts: { $size: "$isSaved" }, isLiked: { $size: "$isLiked" }, title: 1, description: 1, path: 1, createdOn: 1, postBy: { $arrayElemAt: ["$postUser", 0] }, likes: { $size: "$total" }, postby: 1
                }
            },
            {
                $match: { $expr: { $or: [{ $eq: ["$postBy.account_privacy", "public"] }, { $eq: ["$postby",new ObjectId(user?._id)] } ,{ $in :  [ "$postby", userIds ]}] } }
            },
            {
                $sort: sort
            },
            { "$skip": skip },
            { "$limit": 6 },
        ]);
        const postCount = await db.models.post.aggregate([
            {
                $match: condition
            },

            {
                $lookup: {
                    from: "users",
                    localField: "postby",
                    foreignField: "_id",
                    pipeline: [
                        // {
                        //     $project: { name: 1, path: 1 }
                        // }
                    ],
                    as: "postUser"
                }
            },
            {
                $lookup: {
                    from: "saved_posts",
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
                                                new ObjectId(user?._id)
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
                    as: "isSaved"
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
                                                new ObjectId(user?._id)
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
                $lookup: {
                    from: "liked_posts",
                    localField: "_id",
                    foreignField: "post",
                    as: "total"
                }
            },
            {
                $project: {
                    savedPosts: { $size: "$isSaved" }, isLiked: { $size: "$isLiked" }, title: 1, description: 1, path: 1, createdOn: 1, postBy: { $arrayElemAt: ["$postUser", 0] }, likes: { $size: "$total" }, postby: 1
                }
            },
            {
                $match: { $expr: { $or: [{ $eq: ["$postBy.account_privacy", "public"] }, { $eq: ["$postby",new ObjectId(user?._id)] } ,{ $in :  [ "$postby", userIds ]}] } }
            },
            {
                $count : "totalPost"
            }
        ]);
        return {
            postList: posts,
            postCount: postCount[0]?.totalPost,
            page: page,
            condition: condition
        };
    },
    savedPosts: async function (user, modal) {
        const sort = { createdOn: -1 };
        const saved = await db.models.saved_post.aggregate([
            {
                $match: { user: new ObjectId(user._id) }
            },
            {
                $sort: sort
            },
            {
                $lookup: {
                    from: "posts",
                    localField: "post",
                    foreignField: "_id",
                    pipeline: [{
                        $project: { description: 1, path: 1, title: 1, postby: 1 }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "postby",
                            foreignField: "_id",
                            as: "User"
                        }
                    },
                    {
                        $project: { user: { $arrayElemAt: ["$User", 0] }, title: 1, description: 1, path: 1 }
                    }
                    ],
                    as: "postDetails"
                }
            },
            {
                $project: { post: { $arrayElemAt: ["$postDetails", 0] } }
            },
        ]);
        return saved;
    },
    likedPosts: async function (user, modal) {
        const sort = { createdOn: -1 };
        const liked = await db.models.liked_post.aggregate([
            {
                $match: { user: new ObjectId(user._id) }
            },
            {
                $sort: sort
            },
            {
                $lookup: {
                    from: "posts",
                    localField: "post",
                    foreignField: "_id",
                    pipeline: [{
                        $project: { description: 1, path: 1, title: 1, postby: 1 }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "postby",
                            foreignField: "_id",
                            as: "User"
                        }
                    },
                    {
                        $project: { user: { $arrayElemAt: ["$User", 0] }, title: 1, description: 1, path: 1 }
                    }
                    ],
                    as: "postDetails"
                }
            },
            {
                $project: { post: { $arrayElemAt: ["$postDetails", 0] } }
            },
        ]);
        return liked;
    },
    viewPost: async function (id) {
        const postList = await db.models.post.aggregate([
            {
                $match: { _id: new ObjectId(id) }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "postby",
                    foreignField: "_id",
                    pipeline: [{
                        $project: { name: 1, path: 1 }
                    }],
                    as: "postby"
                }
            },
            {
                $project: { postBy: { $arrayElemAt: ["$postby", 0] }, title: 1, description: 1, path: 1 }
            }
        ]);
        return postList;
    },
    archived: async function (id) {
        const archived = await db.models.post.aggregate([
            {
                $match: { postby: new ObjectId(id), isDeleted: true }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "postby",
                    foreignField: "_id",
                    pipeline: [{
                        $project: { name: 1, path: 1 }
                    }],
                    as: "postby"
                }
            },
            {
                $project: { postBy: { $arrayElemAt: ["$postby", 0] }, title: 1, description: 1, path: 1, createdOn: 1 }
            },
        ]);
        return archived;
    }
} 

module.exports = {
    getPosts: async function (query, user, isXhr, page) {
        const condition = { isDeleted: false };
        const regex = query.search;
        const skip = (page - 1) * 5;
        const sort = { createdOn: -1 };
        if (isXhr) {
            if (query.filter == "Mine") condition.postby = new ObjectId(user?._id);
            if (query.filter == "Others") condition.postby = { $ne: new ObjectId(user?._id) };
            if (query.sort == "Title") {
                sort.title = 1;
                delete sort.createdOn;
            }
            else sort.createdOn = -1;
            if (regex != "empty") {
                condition["$or"] = [{ title: { $regex: regex, $options: 'i' } }, { description: { $regex: regex, $options: 'i' } }]
            }
        }
        const data = await db.models.post.aggregate([
            {
                $match: condition
            },
            {
                $sort: sort
            },
            { "$skip": skip },
            { "$limit": 5 },
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
            }, {
                $project: { savedPosts: { $size: "$isSaved" }, title: 1, description: 1, path: 1, createdOn: 1, postBy: { $arrayElemAt: ["$postby", 0] },
                likes : { $size : "$likes" } ,  isLiked : { $size :   { $setIntersection : [ [user._id], "$likes" ] } } }
            }
        ]);
        return {
            postList: data,
            page: page,
            condition: condition
        };
    },
    savedPosts: async function (user) {
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
                $project: { post: { $arrayElemAt: ["$postDetails", 0] }  }
            },
        ]);
        return saved;
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

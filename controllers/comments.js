module.exports = {
    getComments: async function (postId) {
        const comments = await db.models.comments.aggregate([
            {
                $match: { postId: new ObjectId(postId) }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $sort: { createdOn: -1 }
            },
            {
                $project: { users: { $arrayElemAt: ["$userDetails", 0] }, comment: 1, createdOn: 1, postId: 1 }
            }
        ]);
        return comments;
    }
}
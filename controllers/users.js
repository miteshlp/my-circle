module.exports = async (userId) => {
    const followCount = {
        followers: await db.models.follower.find({ userId: new ObjectId(userId), status: "following" }).count(),
        following: await db.models.follower.find({ followerId: new ObjectId(userId), status: "following" }).count(),
    }
    return followCount;
}

var express = require('express');
var router = express.Router();
const postsController = require('../controllers/posts');
const comments = require('../controllers/comments');

router.post('/:userId/followers/requested', async function (req, res, next) {
    try {
        const userId = req.params.userId;
        const isPublic = await db.models.user.find({ _id: new ObjectId(userId), account_privacy: "public" });
        const notificationObject = {
            receiverId: userId,
            notifireId: req.user._id
        };
        const notifire = await db.models.user.findOne({ _id: new ObjectId(userId) , isDeleted : false },{name : "$name.full"});
        if (isPublic.length) {
            await db.models.follower.create({ userId: userId, followerId: req.user._id, status: "following" });
            notificationObject.message = "following you !"
            await db.models.notification.create(notificationObject);
            io.to(userId.toString()).emit("newNotification", notifire.name + " " + notificationObject.message);
            return res.status(201).json({
                "status": 201,
                "message": "Following !"
            })
        }
        await db.models.follower.create({ userId: userId, followerId: req.user._id });
        notificationObject.message = "sent you follow request. !"
        await db.models.notification.create(notificationObject);
        io.to(userId.toString()).emit("newNotification", notifire.name + " " + notificationObject.message);

        // get request count to show in requestnotify badge
        const requestCount = await db.models.follower.find({ userId: userId, status: "requested" }).count();
        io.to(userId).emit("requestNotify", requestCount);

        res.status(201).json({
            "status": 202,
            "message": "follow request sent !"
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            "status": 500,
            "message": "Error while sending follow request !"
        });
    }
});

router.get('/followers/requests', async function (req, res, next) {
    try {
        const requests = await db.models.follower.aggregate([
            {
                $match: { userId: new ObjectId(req.user._id) }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "followerId",
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
        res.render('./users/requests', { requests: requests });
    } catch (err) {
        res.status(500).json({
            "status": 500,
            "message": "Error while sending follow request !"
        })
    }
});

router.put('/followers/requests/:requestId/:status', async function (req, res, next) {
    try {
        if (req.params.status == "true") {
            await db.models.follower.updateOne({ _id: new ObjectId(req.params.requestId) }, { $set: { status: "following" } });
            return res.status(201).json({
                "status": 201,
                "message": "follow request accepted !",
            })
        }
        else {
            await db.models.follower.deleteOne({ _id: new ObjectId(req.params.requestId) });
            res.status(201).json({
                "status": 201,
                "message": "follow request rejected !"
            })
        }
    } catch (err) {
        res.status(500).json({
            "status": 500,
            "message": "Error while request action !"
        });
    }
});

module.exports = router;
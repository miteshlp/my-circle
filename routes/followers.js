var express = require('express');
var router = express.Router();
const postsController = require('../controllers/posts');
const comments = require('../controllers/comments');

router.post('/:userId/followers/requested', async function (req, res, next) {
    try {
        await db.models.follower.create({userId : req.params.userId ,followerId : req.user._id});
        res.status(201).json({
            "status": 201,
            "message": "follow request sent !"
        })
    } catch (err) {
        console.log("error in saved post ", err);
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
                $match :{userId : req.user._id}
            }
        ]);
        console.log(requests);
        res.render('./users/requests', {requests: requests});
    } catch (err) {
        console.log("error in saved post ", err);
        res.status(500).json({
            "status": 500,
            "message": "Error while sending follow request !"
        })
    }
});

module.exports = router;
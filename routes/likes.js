var express = require('express');
var router = express.Router();
const postsController = require('../controllers/posts');
const comments = require('../controllers/comments');

router.get('/liked', async function (req, res, next) {
    try {
      const liked = await postsController.likedPosts(req.user, "like");
      res.render('./posts/liked-post', { liked: liked });
    } catch (err) {
  
      res.status(500).json({
        "status": 500,
        "message": "Error while geting liked post !"
      })
    }
  });

router.get('/:postId/likes', async function (req, res, next) {
    try {
        const likedBy = await db.models.liked_post.aggregate([
            {
                $match: { post: new ObjectId(req.params.postId) }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "postDetails"
                }
            },
            {
                $project: { users: { $arrayElemAt: ["$postDetails", 0] } }
            },
        ]);
        return res.render('./posts/liked_by', { likedBy: likedBy, layout: "blank" });

    } catch (err) {
        res.status(400).json({
            "status": 400,
            "message": "Error while saving or unsaving post !"
        })
    }
});

router.post('/:postId/likes', async function (req, res, next) {
    try {
        if (await db.models.liked_post.findOne({ post: req.params.postId, user: req.user._id })) {
            await db.models.liked_post.deleteOne({ post: req.params.postId, user: req.user._id })
            return res.status(202).json({
                "status": 202,
                "message": "Post unLiked !"
            })
        }
        req.body.user = req.user._id;
        req.body.post = req.params.postId;
        await db.models.liked_post.create(req.body);
        res.status(201).json({
            "status": 201,
            "message": "Post liked !"
        })
    } catch (err) {
        res.status(400).json({
            "status": 400,
            "message": "Error while post like !"
        })
    }
});

module.exports = router;
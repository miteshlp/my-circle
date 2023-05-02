var express = require('express');
var router = express.Router();
// const postsController = require('../controllers/posts');
const comments = require('../controllers/comments');


router.get('/:postId/comments', async function (req, res, next) {
    try {
        const allComments = await comments.getComments(req.params.postId);
        res.render('./posts/comments', { layout: "blank", comments: allComments, id: req.params.postId });
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            "status": 400,
            "message": "Error while getting comments !"
        });
    }
});

router.post('/:postId/comments', async function (req, res, next) {
    try {
        req.body.userId = req.user._id;
        req.body.postId = req.params.postId;
        await db.models.comments.create(req.body);
        const allComments = await comments.getComments(req.body.postId);
        return res.render('./posts/comments', { layout: "blank", comments: allComments, id: req.body.postId });
    } catch (err) {
        console.log("error in save ", err);
        res.status(400).json({
            "status": 400,
            "message": "Error while adding comment !"
        })
    }
});

router.delete('/:postId/comments/:commentId', async function (req, res, next) {
    try {
        if (await db.models.comments.deleteOne({ _id: req.params.commentId, postId : req.params.postId ,userId: req.user._id })) {
            return res.status(202).json({
                "status": 201,
                "message": "Comment deleted !"
            })
        }
        return res.status(404).json({
            "status": 404,
            "message": "Comment not found !"
        })

    } catch (err) {
        console.log("error in save ", err);
        res.status(400).json({
            "status": 400,
            "message": "Error while deleting comment !"
        })
    }
});


module.exports = router;
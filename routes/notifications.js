var express = require('express');
var router = express.Router();
const notificationController = require('../controllers/notifications');

router.get('/notifications', async function (req, res, next) {
    try {
        console.log("in noty");
        const allNotifications = await notificationController.getNotifications(req.user._id);
        res.render('./users/notifications', { allNotifications: allNotifications });
    } catch (err) {

        res.status(500).json({
            "status": 500,
            "message": "Error while geting liked post !"
        })
    }
});

module.exports = router;
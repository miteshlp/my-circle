var express = require('express');
var router = express.Router();
const notificationController = require('../controllers/notifications');

router.get('/notifications', async function (req, res, next) {
    try {
        const allNotifications = await notificationController.getNotifications(req.user._id);
        console.log(allNotifications);
        res.render('./users/notifications', { allNotifications: allNotifications});
    } catch (err) {

        res.status(500).json({
            "status": 500,
            "message": "Error while geting liked post !"
        })
    }
});

router.get('/notifications/unSeen', async function (req, res, next) {
    try {
        const unSeen = await notificationController.getUnseen(req.user._id);
        console.log(unSeen);
        res.render('./users/unSeen', { unSeen: unSeen, layout: "blank" });
    } catch (err) {

        res.status(500).json({
            "status": 500,
            "message": "Error while geting liked post !"
        })
    }
});

module.exports = router;
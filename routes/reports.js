var express = require('express');
var router = express.Router();
const cron = require("node-cron");

router.get('/', async function (req, res, next) {
  const report = {};
  // cron.schedule("* * * * * *", function () {
  //   console.log("cron executing");
  // });
  report.posts = await db.models.post.find({ postby: req.user._id, isDeleted: false }).count();
  report.savedPosts = await db.models.saved_post.find({ user: req.user._id }).count();
  report.archivedPosts = await db.models.post.find({ postby: req.user._id, isDeleted: true }).count();
  report.savedByOthers = await db.models.saved_post.find({ user: { $ne: req.user._id } }).count();
  res.render('./reports/report', { report: report });
});


module.exports = router;
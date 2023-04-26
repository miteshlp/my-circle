var express = require('express');
var router = express.Router();
const cron = require("node-cron");

router.get('/', async function (req, res, next) {
  const report = {};
  cron.schedule("* * * * * *", function () {
    console.log("cron executing");
  });
  report.users = await db.models.user.find({ isDeleted: false }).count();
  report.posts = await db.models.post.find({ isDeleted: false }).count();
  report.saved_posts = await db.models.saved_post.find().count();
  report.deletedUsers = await db.models.user.find({ isDeleted: true }).count();
  report.archivedPosts = await db.models.post.find({ isDeleted: true }).count();
  res.render('./reports/report', { report: report });
});


module.exports = router;
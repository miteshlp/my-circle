var express = require('express');
var router = express.Router();
const multer = require('multer')
var path = require('path');
const pagination = require('../controllers/pagination');
const usersController = require('../controllers/users');

var storage = multer.diskStorage(
  {
    destination: function (req, file, cb) {
      cb(null, './public/uploads/users')
    },
    filename: function (req, file, cb) {
      cb(null, req.user._id + ".jpg");
    }
  }
);
var upload = multer({
  storage: storage,

  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
      req.fileError = `Only jpg, jpeg ,gif and png files are allowed.`;
      return callback(null, false)
    }
    callback(null, true)
  },
  limits: {
    fileSize: 1024 * 2048
  }
});


/* GET users listing. */
router.get('/', async function (req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    let status = false;
    if (req.xhr) status = true;
    const limit = 8
    const result = await usersController.get(req.query, req.user, status, page, limit);

    const obj = pagination(result.userCount, page, limit);
    console.log(obj);

    if (req.xhr) {
      return res.render('./users/filter', { userList: result.userList, layout: "blank", total: result.userCount, obj: obj, range: result.fromTo });
    }
    res.render('./users/list', { userList: result.userList, total: result.userCount, obj: obj, range: result.fromTo });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      "status": 400,
      "message": "Error while listing users"
    });
  }
});

router.get('/profile/:userId?', async function (req, res, next) {
  try {
    if (req.params.userId) {
      const followCount = await usersController.getFollowCount(req.params.userId);
      const userProfile = await usersController.userProfile(req.params.userId,req.user._id);
      console.log( userProfile[0]);
      return res.render('./users/userProfile', { userProfile: userProfile, followCount: followCount });
    }
    const followCount = await usersController.getFollowCount(req.user._id);
    console.log(req.params.userId);
    res.render('./users/profile', { path: (req.user.path) ? req.user.path : "/images/no-image.png", followCount: followCount });

  }
  catch (error) {
    console.log(error);
  }
});
router.put('/profile', upload.single('aavtar'), async function (req, res, next) {
  try {
    if (req.fileError) {
      res.status(400).json({
        "status": 400,
        "message": req.fileError
      });
    }
    const update = {
      name: {
        first: req.body.firstName.trim(),
        last: req.body.lastName.trim(),
        full: req.body.firstName + " " + req.body.lastName,
      },
      account_privacy: req.body.account_privacy
    }
    if (req.file) {
      update.path = req.file.path.replace("public", "");
    }
    await db.models.user.updateOne({ email: req.user.email, isDeleted: false }, { $set: update });
    req.session.passport.user = await db.models.user.findOne({ email: req.user.email });

    res.render('./users/profile', { messages: req.flash('info') });
  } catch (error) {
    res.status(500).json({
      "status": 500,
      "message": "Error while profile upadate"
    });
  }
});

module.exports = router;

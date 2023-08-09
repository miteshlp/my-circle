var express = require('express');
var router = express.Router();
const multer = require('multer')
const sharp = require('sharp');
const fs = require('fs');
var path = require('path');
const pagination = require('../controllers/pagination');
const usersController = require('../controllers/users');
const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");

// Create file metadata including the content type for firebase image upload
const metadata = {
  contentType: 'image/jpg',
};


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
    if (parseInt(req.headers["content-length"]) > 2048000) {
      req.fileError = `File size is too large. Maximum allowed size is 2 MB.`;
      return callback(null, false);
    };
    callback(null, true)
  },
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

    if (req.xhr) {
      return res.render('./users/filter', { userList: result.userList, layout: "blank", total: result.userCount, obj: obj, range: result.fromTo });
    }
    res.render('./users/list', { title: "Users | My circle", userList: result.userList, total: result.userCount, obj: obj, range: result.fromTo });
  } catch (err) {
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
      const userProfile = await usersController.userProfile(req.params.userId, req.user._id);
      return res.render('./users/userProfile', { title: "Profile | My circle", userProfile: userProfile, followCount: followCount });
    }
    const followCount = await usersController.getFollowCount(req.user._id);
    return res.render('./users/profile', { title: "Profile | My circle", path: (req.user.path) ? req.user.path : "/images/no-image.png", followCount: followCount });

  }
  catch (error) {
  }
});
router.put('/profile', upload.single('aavtar'), async function (req, res, next) {
  try {
    if (req.fileError) {
      return res.status(400).json({
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
      try {
        const sourcePath = req.file.path;
        const destinationPath = req.file.path.replace("public/", "");

        // Upload image on firebase storage
        const storageRef = ref(firebaseStorage, destinationPath);
        const file = fs.readFileSync(sourcePath);

        // Upload the file and metadata
        await uploadBytes(storageRef, file, metadata)
          .then(() => {
            return getDownloadURL(storageRef);
          }).then((url) => {
            return update.path = url;
          });
      } catch (error) {
        console.log(`error :>> `, error);
        return res.status(500).send('Error processing image.');
      }
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

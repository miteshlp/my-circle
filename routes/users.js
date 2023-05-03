var express = require('express');
var router = express.Router();
const multer = require('multer')
var path = require('path');
const pagination = require('../controllers/pagination');


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
    const condition = { isDeleted: false, _id: { $ne: new ObjectId(req.user._id) } };
    const regex = req.query.search;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * 5;
    const sort = { createdOn: -1 };
    console.log("id================",req.user._id);
    if (req.xhr) {
      if (regex != "empty") {
        condition["$or"] = [{ email: { $regex: regex, $options: 'i' } }, { "name.full": { $regex: regex, $options: 'i' } }]
      }
    }
    const userList = await db.models.user.aggregate([
      {
        $match: condition
      },
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "postby",
          pipeline: [{ $match: { isDeleted: false } }],
          as: "TotalPosts"
        }
      },
      {
        $lookup: {
          from: "saved_posts",
          localField: "_id",
          foreignField: "user",
          as: "TotalSaved"
        }
      },
      {
        $lookup: {
          from: "followers",
          let: {
            user: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [
                        "$followerId",
                        new ObjectId(req.user._id)
                      ]
                    },
                    {
                      $eq: [
                        "$userId",
                        "$$user"
                      ]
                    }
                  ]
                }
              }
            },{
              $project : { status : 1}
            }
          ],
          as: "isFollowed"
        }
      },
      {
        $project: { isFollowed : {$arrayElemAt : ["$isFollowed" ,0]}, savedPosts: { $size: "$TotalSaved" }, posts: { $size: "$TotalPosts" }, name: 1, eamil: 1, path: 1, createdOn: 1, account_privacy: 1 }
      },
      {
        $sort: { createdOn: -1 }
      },
      { "$skip": skip },
      { "$limit": 6 }
    ]);

    const userCount = await db.models.user.find(condition);
    console.log(userList);
    const obj = pagination(userCount.length, page, 6);

    if (req.xhr) {
      return res.render('./users/filter', { userList: userList, layout: "blank", total: userCount.length, obj: obj });
    }
    res.render('./users/list', { userList: userList, total: userCount.length, obj: obj });
  } catch (err) {
    console.log("err in user get---", err);
    res.status(400).json({
      "status": 400,
      "message": "Error while listing users"
    });
  }
});

router.get('/profile', async function (req, res, next) {
  try {
    console.log(req.user);
    res.render('./users/profile', { path: (req.user.path) ? req.user.path : "/images/no-image.png" });
  } catch (error) {
    console.log("error in profile => ", error);
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
    console.log(req.body);
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
    console.log("error in profile edit=> ", error);
    res.status(500).json({
      "status": 500,
      "message": "Error while profile upadate"
    });
  }
});

module.exports = router;

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
  storage: storage, fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
      cb(null, true);
    } else {
      cb(null, false);
      req.flash('info', 'Only .png, .jpg and .jpeg format allowed! ')
      return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
});


/* GET users listing. */
router.get('/', async function (req, res, next) {
  try{
  const condition = { isDeleted: false };
  const regex = req.query.search;
  const page = Number(req.query.page) || 1;
  const skip = (page - 1) * 5;
  const sort = { createdOn: -1 };
  if (req.xhr) {
    if (regex != "empty") {
      condition["$or"] = [{ email: { $regex: regex,$options: 'i' } }, { "name.full": { $regex: regex,$options: 'i' } }]
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
      $project: { savedPosts: { $size: "$TotalSaved" }, posts: { $size: "$TotalPosts" }, name: 1, eamil: 1, path: 1, createdOn: 1, }
    },
    {
      $sort: {createdOn : -1}
    },
    { "$skip": skip },
    { "$limit": 5 }
  ]);

  const userCount = await db.models.user.find(condition);

  const obj = pagination(userCount.length, page, 5);

  if (req.xhr) {
    return res.render('./users/filter', { userList: userList, layout: "blank", total: userCount.length, obj: obj });
  }
  res.render('./users/list', { userList: userList, total: userCount.length, obj: obj });
}catch(err){
  console.log("err in user get---" ,err);
}
});

router.get('/profile', async function (req, res, next) {
  try {
    res.render('./users/profile', { path: (req.user.path) ? req.user.path : "/images/no-image.png" });
  } catch (error) {
    console.log("error in profile => ", error);
  }
});
router.put('/profile', upload.single('aavtar'), async function (req, res, next) {
  try {
    if (req.file) {
      req.body.path = req.file.path.replace("public", "");
    }
    console.log("in update profile");
    await db.models.user.findOneAndUpdate({ email: req.user.email, isDeleted: false }, { $set: req.body });
    req.session.passport.user = await db.models.user.findOne({ email: req.user.email });
    res.render('./users/profile', { messages: req.flash('info') });
  } catch (error) {
    console.log("error in profile edit=> ", error);
  }
});

module.exports = router;

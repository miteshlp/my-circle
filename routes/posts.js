const { match } = require('assert');
var express = require('express');
var router = express.Router();
const multer = require('multer')
var path = require('path');
const pagination = require('../controllers/pagination');

var storage = multer.diskStorage(
  {
    destination: function (req, file, cb) {
      cb(null, './public/uploads/posts')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + ".jpg");
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
  try {
    const condition = { isDeleted: false };
    const regex = req.query.search;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * 5;
    const sort = { createdOn: -1 };
    if (req.xhr) {
      if (req.query.filter == "Mine") condition.postby = new ObjectId(req.user._id);
      if (req.query.filter == "Others") condition.postby = { $ne: new ObjectId(req.user._id) };
      if (req.query.sort == "Title") {
        sort.title = 1;
        delete sort.createdOn;
      }
      else sort.createdOn = -1;
      if (regex != "empty") {
        condition["$or"] = [{ title: { $regex: regex, $options: 'i' } }, { description: { $regex: regex, $options: 'i' } }]
      }
    }
    const postList = await db.models.post.aggregate([
      {
        $match: condition
      },
      {
        $sort: sort
      },
      { "$skip": skip },
      { "$limit": 5 },
      {
        $lookup: {
          from: "users",
          localField: "postby",
          foreignField: "_id",
          pipeline: [{
            $project: { name: 1, path: 1 }
          }],
          as: "postby"
        }
      },
      {
        $lookup: {
          from: "saved_posts",
          let: {
            postId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [
                        "$user",
                        new ObjectId(req.user._id)
                      ]
                    },
                    {
                      $eq: [
                        "$post",
                        "$$postId"
                      ]
                    }
                  ]
                }
              }
            }
          ],
          as: "isSaved"
        }
      }, {
        $project: { savedPosts: { $size: "$isSaved" }, title: 1, description: 1, path: 1, createdOn: 1, postBy: { $arrayElemAt: ["$postby", 0] } }
      }
    ]);
    const postCount = await db.models.post.find(condition);

    const obj = pagination(postCount.length, page, 5);

    if (req.xhr) {
      return res.render('./posts/filter', { postList: postList, layout: "blank", total: postCount.length, obj: obj });
    }
    res.render('./posts/list', { postList: postList, total: postCount.length, obj: obj });
  } catch (err) {
    console.log("error in data get ", err);
  }
});

router.get('/saved', async function (req, res, next) {
  try {
    const saved = await db.models.saved_post.aggregate([
      {
        $match: { user: new ObjectId(req.user._id) }
      },
      {
        $lookup: {
          from: "posts",
          localField: "post",
          foreignField: "_id",
          pipeline: [{
            $project: { discription: 1, path: 1, title: 1, postby: 1 }
          },
          {
            $lookup: {
              from: "users",
              localField: "postby",
              foreignField: "_id",
              as: "User"
            }
          },
          {
            $project: { user: { $arrayElemAt: ["$User", 0] }, title: 1, description: 1, path: 1 }
          }
          ],
          as: "postDetails"
        }
      },
      {
        $project: { post: { $arrayElemAt: ["$postDetails", 0] } }
      },
    ]);
    res.render('./posts/saved-post', { saved: saved });
  } catch (err) {
    console.log("error in saved post ", err);
  }
});

router.post('/save', async function (req, res, next) {
  try {
    if (await db.models.saved_post.findOne({ post: req.body.post, user: req.user._id })) {
      await db.models.saved_post.deleteOne({ post: req.body.post, user: req.user._id })
      return res.send({
        "type": "unSaved"
      });
    }
    req.body.user = req.user._id;
    await db.models.saved_post.create(req.body);
    res.send({
      "type": "saved"
    });
  } catch (err) {
    console.log("error in save ", err);
  }
});

router.post('/unsave', async function (req, res, next) {
  try {
    await db.models.saved_post.deleteOne({ _id: req.body.id });
    res.send({
      "type": "success"
    });
  } catch (err) {
    console.log(err);
  }
});

router.get('/archived', async function (req, res, next) {
  try {
    const archived = await db.models.post.aggregate([
      {
        $match: { postby: new ObjectId(req.user._id), isDeleted: true }
      },
      {
        $lookup: {
          from: "users",
          localField: "postby",
          foreignField: "_id",
          pipeline: [{
            $project: { name: 1, path: 1 }
          }],
          as: "postby"
        }
      },
      {
        $project: { postBy: { $arrayElemAt: ["$postby", 0] }, title: 1, description: 1, path: 1, createdOn: 1 }
      },
    ]);
    res.render('./posts/archived', { archived: archived });
  } catch (err) {
    console.log(err);
  }
});

router.post('/archive', async function (req, res, next) {
  try {
    await db.models.post.updateOne({ _id: req.body.post, postby: req.user._id }, { $set: { isDeleted: true } });
    res.send({
      "type": "success"
    });
  } catch (err) {
    console.log(err);
  }
});

router.put('/restore', async function (req, res, next) {
  try {
    await db.models.post.updateOne({ _id: req.body.id }, { $set: { isDeleted: false } });
    res.send({
      "type": "success"
    });
  } catch (err) {
    console.log(err);
  }
});

router.get('/view/:id', async function (req, res, next) {
  try {
    const postList = await db.models.post.aggregate([
      {
        $match: { _id: new ObjectId(req.params.id) }
      },
      {
        $lookup: {
          from: "users",
          localField: "postby",
          foreignField: "_id",
          pipeline: [{
            $project: { name: 1, path: 1 }
          }],
          as: "postby"
        }
      },
      {
        $project: { postBy: { $arrayElemAt: ["$postby", 0] }, title: 1, description: 1, path: 1 }
      }
    ]);
    res.render('./posts/view', { postList: postList, layout: "blank" });
  } catch (err) {
    console.log("error in view", err);
  }
});

router.get('/create', function (req, res, next) {
  res.render('./posts/create-post');
});

router.post('/create', upload.single('aavtar'), async function (req, res, next) {
  try {
    const create = {
      path: req.file.path.replace("public", ""),
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      postby: req.user._id
    }
    await db.models.post.create(create);
    res.redirect('/posts/');
  } catch (error) {
    res.redirect('/create');
    console.log("error in post create=> ", error);
  }
});

router.get('/edit/:id', async function (req, res, next) {
  const postList = await db.models.post.findOne({ _id: req.params.id }).lean();
  res.render('./posts/edit', { postList: postList, layout: "blank" });
});

router.put('/edit', upload.single('aavtar'), async function (req, res, next) {
  try {
    const id = req.body.id;
    const update = {
      title: req.body.title.trim(),
      description: req.body.description.trim()
    }
    if (req.file) {
      update.path = req.file.path.replace("public", "");
    }
    await db.models.post.updateOne({ _id: new ObjectId(id), postby: new ObjectId(req.user._id) }, { $set: update })
    res.send({ "type": "success" });
  } catch (err) {
    console.log("error in edit", err);
  }
});


module.exports = router;

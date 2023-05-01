const { match } = require('assert');
var express = require('express');
var router = express.Router();
const multer = require('multer')
var path = require('path');
const pagination = require('../controllers/pagination');
const postsController = require('../controllers/posts');

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
  storage: storage,
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.gif') {
      req.fileError = 'Only images are allowed (Max 2mb)';
      return callback(null, false)
    }
    callback(null, true)
  },
  limits: {
    fileSize: 1024 * 2048
  }
});
/* GET Post listing. */
router.get('/', async function (req, res, next) {
  try {
    var page = Number(req.query.page) || 1;
    let status = false;
    if (req.xhr) status = true;
    let result = await postsController.getPosts(req.query, req.user, status, page);
    if (result.postList.length == 0 && page > 1) {
      page -= 1;
      result = await postsController.getPosts(req.query, req.user, status, page);
    }
    const postCount = await db.models.post.find(result.condition);
    const obj = pagination(postCount.length, result.page, 5);
    if (req.xhr) {
      return res.render('./posts/filter', { postList: result.postList, layout: "blank", total: postCount.length, obj: obj });
    }
    res.render('./posts/list', { postList: result.postList, total: postCount.length, obj: obj });
  } catch (err) {
    console.log("error in data get ", err);
    res.status(500).json({
      "status": 500,
      "message": "Error while getting data !"
    })
  }
});

/* GET saved post listing. */
router.get('/saved', async function (req, res, next) {
  try {
    const saved = await postsController.savedPosts(req.user,"save");
    console.log("saved", saved);
    res.render('./posts/saved-post', { saved: saved });
  } catch (err) {

    console.log("error in saved post ", err);
    res.status(500).json({
      "status": 500,
      "message": "Error while geting saved post !"
    })
  }
});

router.get('/liked', async function (req, res, next) {
  try {
    const liked = await postsController.likedPosts(req.user,"like");
    console.log("liked", liked);
    res.render('./posts/liked-post', { liked: liked });
  } catch (err) {

    console.log("error in saved post ", err);
    res.status(500).json({
      "status": 500,
      "message": "Error while geting saved post !"
    })
  }
});

/* POST  Save Unsave Post Toggle. */
router.post('/save', async function (req, res, next) {
  try {
    if (await db.models.saved_post.findOne({ post: req.body.post, user: req.user._id })) {
      await db.models.saved_post.deleteOne({ post: req.body.post, user: req.user._id })
      return res.status(202).json({
        "status": 202,
        "message": "Post unsaved !"
      })
    }
    req.body.user = req.user._id;
    await db.models.saved_post.create(req.body);
    res.status(201).json({
      "status": 201,
      "message": "Post saved !"
    })
  } catch (err) {
    console.log("error in save ", err);
    res.status(400).json({
      "status": 400,
      "message": "Error while saving or unsaving post !"
    })
  }
});

/* GET archived post listing. */
router.get('/archived', async function (req, res, next) {
  try {
    const archived = await postsController.archived(req.user._id);
    res.render('./posts/archived', { archived: archived });
  } catch (err) {
    res.status(400).json({
      "status": 400,
      "message": "Error while rendering archive post page !"
    });
  }
});

/* POST archive post. */
router.post('/archive', async function (req, res, next) {
  try {
    await db.models.post.updateOne({ _id: req.body.post, postby: req.user._id }, { $set: { isDeleted: true } });
    return res.status(202).json({
      "status": 202,
      "message": "Post archived successfully !"
    });
  } catch (err) {
    res.status(400).json({
      "status": 400,
      "message": "Error while post archive !"
    });
  }
});

router.put('/restore', async function (req, res, next) {
  try {
    await db.models.post.updateOne({ _id: req.body.id }, { $set: { isDeleted: false } });
    res.status(202).json({
      "status": 202,
      "message": "Post restored successfully !"
    });
  } catch (err) {
    res.status(400).json({
      "status": 400,
      "message": "Error while restoring post !"
    });
  }
});

router.get('/view/:id', async function (req, res, next) {
  try {
    const postList = await postsController.viewPost(req.params.id);
    res.render('./posts/view', { postList: postList, layout: "blank" });
  } catch (err) {
    res.status(400).json({
      "status": 400,
      "message": "Error while viewing post !"
    });
  }
});

router.get('/create', function (req, res, next) {
  try {
    res.render('./posts/create-post');
  } catch (err) {
    res.status(400).json({
      "status": 400,
      "message": "Error while loading create post page !"
    });
  }
});

router.post('/create', upload.single('aavtar'), async function (req, res, next) {
  try {
    if (req.fileError) {
      return res.status(400).json({
        "status": 400,
        "message": req.fileError
      });
    }
    console.log(req.body, req.file);
    const create = {
      path: req.file.path.replace("public", ""),
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      postby: req.user._id
    }
    await db.models.post.create(create);
    res.status(201).json({
      "status": 201,
      "message": "Post created successfully !"
    });
  } catch (error) {
    res.status(400).json({
      "status": 400,
      "message": "Error while creating post !"
    });
  }
});

router.get('/edit/:id', async function (req, res, next) {
  try {
    const postList = await db.models.post.findOne({ _id: req.params.id }).lean();
    res.render('./posts/edit', { postList: postList, layout: "blank" });
  } catch (err) {
    return res.status(400).json({
      "status": 400,
      "message": "Error while page loading !"
    });
  }
});

router.put('/edit', upload.single('aavtar'), async function (req, res, next) {
  try {
    if (req.fileError) {
      return res.status(400).json({
        "status": 400,
        "message": req.fileError
      });
    }
    const id = req.body.id;
    const update = {
      title: req.body.title.trim(),
      description: req.body.description.trim()
    }
    if (req.file) {
      update.path = req.file.path.replace("public", "");
    }
    await db.models.post.updateOne({ _id: new ObjectId(id), postby: new ObjectId(req.user._id) }, { $set: update })
    return res.status(202).json({
      "status": 202,
      "message": "Post updated successfully !"
    });
  } catch (err) {
    res.status(400).json({
      "status": 400,
      "message": "error while post edit"
    });
  }
});

router.post('/likes', async function (req, res, next) {
  try {
    if (await db.models.liked_post.findOne({ post: req.body.post, user: req.user._id })) {
      await db.models.liked_post.deleteOne({ post: req.body.post, user: req.user._id })
      return res.status(202).json({
        "status": 202,
        "message": "Post unLiked !"
      })
    }
    req.body.user = req.user._id;
    await db.models.liked_post.create(req.body);
    res.status(201).json({
      "status": 201,
      "message": "Post liked !"
    })
  } catch (err) {
    console.log("error in save ", err);
    res.status(400).json({
      "status": 400,
      "message": "Error while post like !"
    })
  }
});

router.get('/liked-by/:id', async function (req, res, next) {
  try {
    const likedBy = await db.models.liked_post.aggregate([
        {
            $match: { post: new ObjectId(req.params.id) }
        },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "postDetails"
            }
        },
        {
            $project: { users: { $arrayElemAt: ["$postDetails", 0] }  }
        },
    ]);
    return res.render('./posts/liked_by', { likedBy: likedBy, layout: "blank" });

  } catch (err) {
    console.log("error in save ", err);
    res.status(400).json({
      "status": 400,
      "message": "Error while saving or unsaving post !"
    })
  }
});

module.exports = router;

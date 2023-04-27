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
/* GET users listing. */
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
  }
});

router.get('/saved', async function (req, res, next) {
  try {
    const saved = await postsController.savedPosts(req.user);
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
    const archived = await postsController.archived(req.user._id);
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
    const postList = await postsController.viewPost(req.params.id);
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
    if(req.fileError){
      return res.status(400).json({
        "status": 400,
        "message": req.fileError
      });
    }
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
    if(req.fileError){
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
    res.send({ "type": "success" });
  } catch (err) {
    res.status(400).json({
      "status": 400,
      "message": "error while post edit"
    });
  }
});


module.exports = router;

var express = require('express');
var router = express.Router();
const passport = require('passport');
const pagination = require('../controllers/pagination');

/* GET home page. */
router.get('/', async function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/posts');
  }
  try {
    const condition = { isDeleted: false };
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * 5;
    const regex = req.query.search;
    const sort = { createdOn: -1 };
    if (req.xhr) {
      if (regex != "empty") {
        condition["$or"] = [{ title: { $regex: regex, $options: 'i' } }, { description: { $regex: regex, $options: 'i' } }]
      }
      if (req.query.sort == "Title") {
        sort.title = 1;
        delete sort.createdOn;
      }
      else sort.createdOn = -1;
    }
    const postList = await db.models.post.aggregate([
      {
        $match: condition
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
      {
        $sort: sort
      },
      { "$skip": skip },
      { "$limit": 5 }
    ]);

    const postCount = await db.models.post.find(condition);
    const obj = pagination(postCount.length, page, 5);
    if (req.xhr) {
      return res.render('./posts/filter', { postList: postList, layout: "blank", obj: obj });
    }
    res.render('index', { title: 'Landing Page', postList: postList, total: postCount.length, menu: "sign-in", layout: 'public', obj: obj });
  } catch (err) {
    console.log("error in data get ", err);
  }
});

router.get('/sign-in', function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/posts');
  }
  res.render('sign-in', { title: 'Sign in Page', menu: "sign-up", layout: 'public', messages: req.flash('info') });
});

router.post('/sign-in', function (req, res, next) {
  try {

    passport.authenticate('local', function (err, user) {
      if (err) {
        return next(err)
      }
      if (!user) {
        return res.redirect('/sign-in');
      }
      req.logIn(user, function (err) {
        res.redirect('/posts');
      });
    })(req, res, next);
  } catch (error) {
    req.flash('info', 'error while sign in !');
  }
});

router.get('/sign-up', function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/posts');
  }
  res.render('sign-up', { title: 'Sign up Page', layout: 'public', messages: req.flash('info') });
});

router.get('/email-validation', async function (req, res) {
  try{
    if (await db.models.user.findOne({ email: req.query.email })) {
        return res.send(false)
      }
      res.send(true);
    }catch(err){
      console.log("error in email validate" , err);
    }
});

router.post('/sign-up', async function (req, res) {
  try {
    if (!(await db.models.user.find({ email: req.body.email, isDeleted: false })).length) {
      // req.body.password = md5(req.body.password);
      req.body.name = {
        first: req.body.firstName,
        last: req.body.lastName,
        full: req.body.firstName + " " + req.body.lastName
      };
      req.body.path = "/images/no-image.png";
      await db.models.user.create(req.body);
      res.render('sign-in', { layout: 'public', messages: req.flash('info') });
    } else {
      req.flash('info', `User already exist with ${req.body.email} !`);
      res.render('sign-up', { layout: 'public', messages: req.flash('info') });
    }
  } catch (error) {
    req.flash('info', 'Error while registration. !');
    res.render('sign-up', { layout: 'public', messages: req.flash('info') });
  }
});

router.get('/logout', async function (req, res) {
  if (req.isAuthenticated()) {
    req.logOut();
  }
  res.redirect('/');
})

router.get('/search/:match', async function (req, res, next) {
  try {
    const condition = { isDeleted: false };
    if (req.params.match != "empty") {
      condition["$or"] = [{ title: { $regex: req.params.match } }, { description: { $regex: req.params.match } }]
    }
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * 5;
    const postList = await db.models.post.aggregate([
      {
        $match: condition
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
      { "$skip": skip },
      { "$limit": 5 }
    ]);
    res.render('./posts/filter', { postList: postList, layout: "blank" });
  } catch (err) {
    console.log("error in search", err);
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

module.exports = router;

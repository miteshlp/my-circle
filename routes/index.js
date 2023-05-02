var express = require('express');
var router = express.Router();
const passport = require('passport');
const pagination = require('../controllers/pagination');
const postsController = require('../controllers/posts');

/* GET home page. */
router.get('/', async function (req, res) {
  try {
    if (req.isAuthenticated()) {
      return res.redirect('/posts');
    }
    var page = Number(req.query.page) || 1;
    let status = false;
    if (req.xhr) status = true;
    let result = await postsController.getPosts(req.query, req.user, status, page);
    if (result.postList.length == 0 && page > 1) {
      page -= 1;
      result = await postsController.getPosts(req.query, req.user, status, page);
    }
    const postCount = await db.models.post.find(result.condition);
    const obj = pagination(postCount.length, result.page, 6);
    if (req.xhr) {
      return res.render('./posts/filter', { postList: result.postList, layout: "blank", obj: obj });
    }
    res.render('index', { title: 'Landing Page', postList: result.postList, total: postCount.length, menu: "sign-in", layout: 'public', obj: obj });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      "status": 500,
      "message": "Error while getting post"
    });
  }
});

router.get('/sign-in', function (req, res) {
  try {
    if (req.isAuthenticated()) {
      return res.redirect('/posts');
    }
    res.render('sign-in', { title: 'Sign in Page', menu: "sign-up", layout: 'public', messages: req.flash('info') });
  } catch (err) {
    res.status(500).json({
      "status": 500,
      "message": "Error while rendering sign-in page !"
    });
  }
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
    res.status(500).json({
      "status": 500,
      "message": "Error while sign-in !"
    });
  }
});

router.get('/sign-up', function (req, res) {
  try{

    if (req.isAuthenticated()) {
      return res.redirect('/posts');
    }
    res.render('sign-up', { title: 'Sign up Page', layout: 'public', messages: req.flash('info') });
  }catch(err){
    res.status(400).json({
      "status": 400,
      "message": "Error while rendering sign-up page !"
    });
  }
});

router.get('/email-validation', async function (req, res) {
  try {
    if (await db.models.user.findOne({ email: req.query.email })) {
      return res.send(false)
    }
    res.send(true);
  } catch (err) {
    console.log("error in email validate", err);
    res.status(409).json({
      "status": 409,
      "message": "Error while email validate !"
    });
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

router.get('/view/:id', async function (req, res, next) {
  try {
    const postList = await postsController.viewPost(req.params.id);
    res.render('./posts/view', { postList: postList, layout: "blank" });
  } catch (err) {
    console.log("error in view", err);
    res.status(400).json({
      "status": 400,
      "message": "Error while view post!"
    });
  }
});

module.exports = router;

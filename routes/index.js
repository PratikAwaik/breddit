const express = require('express');
const router = express.Router();

const Club = require('../models/club');

// Controllers
const authController = require('../controllers/authController');

/* GET home page. */
router.get('/', function(req, res, next) {
  Club.find({}).exec((err, clubs) => {
    if (err) return next(err);
    res.render('index', { clubs });
  });
});

// Sign Up Route GET
router.get('/register', authController.signUpGet);

// Sign Up Route POST
router.post('/register', authController.signUpPost);

// Log In Route GET
router.get('/login', authController.logInGet);

// Log In Route POST
router.post('/login', authController.logInPost, (req, res, next) => {
  if (req.session.returnTo) { 
    res.redirect(req.session.returnTo);
    delete req.session.returnTo;
    return;
  } else return res.redirect('/');
});

// Log Out Route GET
router.get('/logout', authController.logOutGet);

module.exports = router;

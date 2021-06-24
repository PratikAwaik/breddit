const User = require('../models/user');

const bcrypt = require('bcryptjs');
const passport = require('passport');
const { body, validationResult, check } = require('express-validator');

exports.signUpGet = (req, res, next) => {
    res.render('sign-up', { title: 'Sign Up' })
}

exports.signUpPost = [
    body('first_name', 'First Name must be specified').trim().isLength({ min: 1 }).escape(),
    body('last_name', 'Last Name must be specified').trim().isLength({ min: 1 }).escape(),
    body('username', 'Username must be specified').trim().isLength({ min: 1 }).escape().custom(value => {
        return User.exists({ 'username': { $regex: value, $options: 'i' } }).then(user => {
            if (user) {
                return Promise.reject('This username is already taken');
            }
        })
    }).custom(value => {
        if (value.length < 3 || value.length > 30) { 
            throw new Error('The username must be more than 3 and less than 30 characters');
        }
        return true;
    }).custom(value => {
        const expr = /^[a-zA-Z0-9._]*$/;
        if (!expr.test(value.toLowerCase())) {
            throw new Error('The username must contain only a-z or A-Z or 0-9 or (.) or (_)');
        }
        return true;
    }),
    check('password').exists().escape(),
    check('confirm_password', 'The password does not match with your previous password').exists().custom((value, { req }) => value === req.body.password),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const user = {
                first_name: req.body.first_name, 
                last_name: req.body.last_name,
                username: req.body.username, 
            }
            return res.render('sign-up', { title: 'Sign Up', errors: errors.array(), user });
        } else next();
    }, 

    passport.authenticate('signup', {
        successRedirect: '/', 
        failureRedirect: '/register',
    })
];

exports.logInGet = (req, res, next) => {
    const errorUsername = req.flash('errorUsername');
    const errorPassword = req.flash('errorPassword');
    const previousUsername = req.flash('previousUsername');
    console.log(req.body);
    res.render('log-in', { title: 'Log In', errorUsername, errorPassword, previousUsername });
}

exports.logInPost = passport.authenticate('local', {
    failureRedirect: '/login', 
    failureFlash: true
});

exports.logOutGet = (req, res, next) => {
    req.logout();
    res.redirect('/');
}
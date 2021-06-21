const User = require('../models/user');

exports.getUser = (req, res, next) => {
    User.find({ 'username': req.params.username }).exec(function(err, user) {
        if (err) return next(err);
        res.render('user-display', { user });
    });
}
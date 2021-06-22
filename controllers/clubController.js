const async = require('async');

const Club = require('../models/club');
const Post = require('../models/post');

const { body, validationResult } = require('express-validator');
const fs = require('fs');

// initialize multer for file Upload
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage, 
    limits: {
        fileSize: 120000, 
    }, 
});

const ensureAuth = require('../middlewares/authMiddleware');

/**
 * Club Methods
*/

exports.clubDisplay = (req, res, next) => {
    Club.findById(req.params.id).populate('members').populate('admin').populate({ path: 'posts', populate: { path: 'author', model: 'User' } }).exec((err, club) => {
        if (err) return next(err);
        res.render('club-display', { club });
    })  
}

exports.clubNewGet = [ 
    ensureAuth,
    (req, res, next) => {
        return res.render('club-form', { title: 'Create New Club' });
    }
];

exports.clubNewPost = [
    body('club_name', 'Name must be specified').trim().escape(),
    body('club_description', 'Description must not be empty').trim().escape(),

    upload.single('club_profile_picture'),

    (err, req, res, next) => {
        const errors = validationResult(req);
 
        if (err || !errors.isEmpty()) {
            const inputClubDetails = {
                name: req.body.club_name, 
                description: req.body.club_description, 
            };
            return res.render('club-form', { title: 'Create New Club', club: inputClubDetails, errors: errors.array(), multerError: (err instanceof multer.MulterError) ? err.split(' ') : null });
        }

        const imgObj = req.file;

        const club = new Club({
            name: req.body.club_name, 
            description: req.body.club_description, 
            profile_picture: imgObj ? `data:${imgObj.mimetype};base64,${Buffer.from(imgObj.buffer).toString('base64')}` : null,
            created_at: Date.now(), 
            updated_at: null,
            admin: res.locals.currUser._id, 
            members: new Array(res.locals.currUser._id),
        });

        club.save((err) => {
            if (err) return next(err);
            res.redirect(club.url);
        });
    }
];

exports.clubJoinGet = [
    ensureAuth,

    (req, res, next) => {
        async.waterfall([
            function(callback) {
                Club.findById(req.params.id).exec(function(err, club) {
                    callback(err, club);
                });
            }, 
            function(club, callback) {
                const clubMembers = club.members;

                if (!clubMembers.some(memberId => memberId.toString() == res.locals.currUser._id.toString())) {
                    const newMembers = clubMembers.concat(res.locals.currUser._id);
                    Club.findByIdAndUpdate(req.params.id, { members: newMembers }, function(err, newClub) {
                        callback(err, newClub);
                    });
                }
            }
        ], function(err, result) {
            if (err) return next(err);
            res.redirect(result.url);
        });
    }
];

exports.clubUnjoinGet = (req, res, next) => {
    async.waterfall([
        function(callback) {
            Club.findById(req.params.id).exec(function(err, club) {
                callback(err, club);
            });
        }, 
        function(club, callback) {
            const newMembers = club.members.filter(memberId => memberId.toString() != res.locals.currUser._id.toString() );
            Club.findByIdAndUpdate(req.params.id, { members: newMembers }, function(err, newClub) {
                callback(err, newClub);
            });
        }
    ], function(err, result) {
        if (err) return next(err);
        res.redirect(result.url);
    });
}

exports.clubEditGet = [
    ensureAuth, 

    (req, res, next) => {
        Club.findById(req.params.id).populate('admin').exec(function(err, club) {
            if (err) return next(err);
            res.render('club-form', { club });
        });
    }
];

exports.clubEditPost = [
    body('club_name', 'Name must be specified').trim().isLength({ min: 1 }).escape(),
    body('club_description', 'Description must not be empty').trim().isLength({ min: 1 }).escape(),

    upload.single('club_profile_picture'),

    (err, req, res, next) => {
        const errors = validationResult(req);

        if (err || !errors.isEmpty()) {
            const inputClubDetails = {
                name: req.body.club_name, 
                description: req.body.club_description,
                _id: req.params.id,
            };
            return res.render('club-form', { title: 'Update Club', club: inputClubDetails, errors: errors.array(), multerError: (err instanceof multer.MulterError) ? 'This File is too large. Please upload a smaller file.' : null });
        }

        const imgObj = req.file;
        const newDetails = {
            name: req.body.club_name, 
            description: req.body.club_description, 
            updated_at: Date.now(),
        };

        if (imgObj) newDetails.profile_picture = `data:${imgObj.mimetype};base64,${Buffer.from(imgObj.buffer).toString('base64')}`;

        Club.findByIdAndUpdate(req.params.id, newDetails, function(err, club) {
            if (err) return next(err);
            res.redirect(club.url);
        });
    }
];

exports.clubDeleteGet = [
    ensureAuth, 

    (req, res, next) => {
        Club.findById(req.params.id).populate('admin').exec(function(err, club) {
            if (err) return next(err);
            res.render('club-delete', { club });
        });
    }
];

exports.clubDeletePost = (req, res, next) => {
    Club.findByIdAndRemove(req.params.id, function(err) {
        if (err) return next(err);
        res.redirect('/');
    });
}

/**
 * Club Post Methods
*/

exports.postDisplayGet = (req, res, next) => {
    Post.findById(req.params.id).populate('author').populate('club').exec(function(err, post) {
        if (err) return next(err);
        res.render('post-display', { post });
    });
}

exports.postNewGet = (req, res, next) => {
    res.render('post-form');
}

exports.postNewPost = [
    body('post_title').trim().escape(), 
    body('post_message').trim().escape(), 

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const prevPostDetails = {
                title: req.body.post_title, 
                message: req.body.post_message
            }

            return res.render('post-form', { post: prevPostDetails, errors: errors.array() });
        }

        const newPost = new Post({
            title: req.body.post_title, 
            message: req.body.post_message, 
            author: res.locals.currUser._id,
            club: req.params.clubId, 
            posted_at: Date.now(), 
            edited_at: null
        });

        newPost.save(function(err) {
            if (err) return next(err);
        });

        async.waterfall([
            function(callback) {
                Club.findById(req.params.clubId).exec(function(err, club) {
                    callback(err, club);
                });
            }, 

            function(club, callback) {
                const clubPosts = club.posts;
                clubPosts.push(newPost._id);
                
                Club.findByIdAndUpdate(club._id, { posts: clubPosts }, function(err, newClub) {
                    callback(err, newClub);
                });
            }
        ]);

        res.redirect(newPost.url);
    }
];

exports.postEditGet = (req, res, next) => {
    Post.findById(req.params.id).exec(function(err, post) {
        if (err) return next(err);
        res.render('post-form', { post });
    });
}

exports.postEditPost = [
    body('post_title').trim().escape(), 
    body('post_message').trim().escape(), 

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const prevPostDetails = {
                title: req.body.post_title, 
                message: req.body.post_message
            }

            return res.render('post-form', { post: prevPostDetails, errors: errors.array() });
        }

        const newPost = {
            title: req.body.post_title, 
            message: req.body.post_message, 
            _id: req.params.id, 
            edited_at: Date.now(),
        }

        Post.findByIdAndUpdate(req.params.id, newPost, function(err, newPost) {
            if (err) return next(err);
            res.redirect(newPost.url);
        });
    }
];

exports.postDeleteGet = (req, res, next) => {
    Post.findById(req.params.id).exec(function(err, post) {
        if (err) return next(err);
        res.render('post-delete', { post });
    });
}

exports.postDeletePost = (req, res, next) => {
    Post.findByIdAndRemove(req.params.id, function(err) {
        if (err) return next(err);
        res.redirect('/club/' + req.params.clubId);
    });
}
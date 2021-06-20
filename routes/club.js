const express = require('express');
const router = express.Router();

const clubController = require('../controllers/clubController');

/**
 * Club Routes
*/

// Create New Club GET
router.get('/new', clubController.clubNewGet);

// Create New Club POST
router.post('/new', clubController.clubNewPost);

// Show Club Detail
router.get('/:id', clubController.clubDisplay);

// Join Club
router.get('/:id/join', clubController.clubJoinGet);

// Unjoin club
router.get('/:id/unjoin', clubController.clubUnjoinGet);

// Edit Club GET
router.get('/:id/edit', clubController.clubEditGet);

// Edit Club POST
router.post('/:id/edit', clubController.clubEditPost);

// Delete Club GET
router.get('/:id/delete', clubController.clubDeleteGet);

// Delete Club Post
router.post('/:id/delete', clubController.clubDeletePost);

/** 
 * Club Post Routes
*/

// Create a new Post GET
router.get('/:clubId/post/new', clubController.postNewGet);

// Create new Post POST
router.post('/:clubId/post/new', clubController.postNewPost);

// Post display GET
router.get('/:clubId/post/:id', clubController.postDisplayGet);

// Edit Post GET
router.get('/:clubId/post/:id/edit', clubController.postEditGet);

// Edit Post POST
router.post('/:clubId/post/:id/edit', clubController.postEditPost);

// Delete Post GET
router.get('/:clubId/post/:id/delete', clubController.postDeleteGet);

// Delete Post POST
router.post('/:clubId/post/:id/delete', clubController.postDeletePost);

module.exports = router;
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title: { type: String, required: true },
    message: { type: String, required: true }, 
    author: { type: Schema.Types.ObjectId, ref: 'User' }, 
    club: { type: Schema.Types.ObjectId, ref: 'Club' },
    time_stamp: { type: Date },
});

PostSchema
    .virtual('url')
    .get(function() { return '/club/' + this.club.toString() + '/post/' + this._id });

module.exports = mongoose.model('Post', PostSchema);
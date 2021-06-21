const mongoose = require('mongoose');

const moment = require('moment');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title: { type: String, required: true },
    message: { type: String, required: true }, 
    author: { type: Schema.Types.ObjectId, ref: 'User' }, 
    club: { type: Schema.Types.ObjectId, ref: 'Club' },
    posted_at: { type: Date },
    edited_at: { type: Date },
});

PostSchema
    .virtual('url')
    .get(function() { return '/club/' + this.club.toString() + '/post/' + this._id });

PostSchema
    .virtual('getRelativeTimePosted')
    .get(function() { 
        const formattedTime = moment(this.posted_at).local(); 
        return moment(formattedTime, 'YYYYMMDD').fromNow();
    });

PostSchema
    .virtual('getRelativeTimeEdited')
    .get(function() {
        const formattedTime = moment(this.edited_at).local(); 
        return moment(formattedTime, 'YYYYMMDD').fromNow();
    });
    
module.exports = mongoose.model('Post', PostSchema);
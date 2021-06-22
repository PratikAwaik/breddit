const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const moment = require('moment');

const ClubSchema = new Schema({  
    name: { type: String, required: true }, 
    description: { type: String, required: true }, 
    profile_picture: { type: String },
    created_at: { type: Date }, 
    updated_at: { type: Date },
    admin: { type: Schema.Types.ObjectId, ref: 'User' }, 
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }], 
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
});

ClubSchema
    .virtual('url')
    .get(function() { return '/club/' + this._id });

ClubSchema
    .virtual('getRelativeTimePosted')
    .get(function() { 
        const formattedTime = moment(this.created_at).local(); 
        return moment(formattedTime, 'YYYYMMDD').fromNow();
    });

ClubSchema
    .virtual('getRelativeTimeEdited')
    .get(function() {
        const formattedTime = moment(this.updated_at).local(); 
        return moment(formattedTime, 'YYYYMMDD').fromNow();
    });

module.exports = mongoose.model('Club', ClubSchema);

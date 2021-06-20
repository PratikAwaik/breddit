const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClubSchema = new Schema({  
    name: { type: String, required: true }, 
    description: { type: String, required: true }, 
    profile_picture: { type: String },
    admin: { type: Schema.Types.ObjectId, ref: 'User' }, 
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }], 
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
});

ClubSchema
    .virtual('url')
    .get(function() { return '/club/' + this._id });

module.exports = mongoose.model('Club', ClubSchema);

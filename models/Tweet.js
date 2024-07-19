const mongoose = require('mongoose');

const tweetSchema = mongoose.Schema({
    content: String,
    tweetDate: Date,
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    isLikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users', default: [] }],
});

const Tweet = mongoose.model('tweets', tweetSchema);

module.exports = Tweet;
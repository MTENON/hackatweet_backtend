const mongoose = require('mongoose');

const hashtagSchema = mongoose.Schema({
    hashtag: String,
    tweets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'tweets' }]
});

const Hashtag = mongoose.model('hashtags', hashtagSchema);

module.exports = Hashtag;
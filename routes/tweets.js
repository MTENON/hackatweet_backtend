var express = require('express');
var router = express.Router();
const { checkBody } = require('../modules/checkbody')

//Import des databases
const User = require('../models/User')
const Tweet = require('../models/Tweet');
const Hashtag = require('../models/Hashtags');

//récupérer tous les tweets pour affichage
router.get('/', (req, res) => {
    Tweet.find()
        .populate('creator')
        .then(data => {
            const sentData = data.map(e => {
                return { content: e.content, date: e.tweetDate, firstname: e.creator.firstname, username: e.creator.username }
            })
            res.json(sentData);
        })
});


//ajouter un tweet
//ajoute les hashtags en premier, vérifie leur existence ou non et renvoie les hashtags créés.
router.post('/newTweet', (req, res) => {
    if (!checkBody(req.body, ['content', 'token', 'hashtags'])) {
        res.json({ result: false, error: 'checkbody sent false' })
    } else {
        User.findOne({ token: req.body.token }).then(data => {
            const newTweet = new Tweet({
                content: req.body.content,
                tweetDate: new Date(),
                creator: data._id,
            });

            newTweet.save().then((data) => {
                res.json({ result: true, data })
            })
        });


    }
})

module.exports = router;
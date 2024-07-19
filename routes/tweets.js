var express = require('express');
var router = express.Router();
const { checkBody } = require('../modules/checkbody')
const moment = require('moment');

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
                return { content: e.content, date: moment.utc(e.tweetDate).fromNow(), firstname: e.creator.firstname, username: e.creator.username }
            })
            res.json(sentData);
        })
});


//ajouter un tweet
//ajoute les hashtags en premier, vérifie leur existence ou non et renvoie les hashtags créés.
router.post('/newTweet', (req, res) => {

    //utilisés pour le rendu final des données
    let tweetId = '';

    if (!checkBody(req.body, ['content', 'token'])) {
        res.json({ result: false, error: 'checkbody sent false' })
    } else {
        if (!(req.body.hashtags === null)) {
            //Si il y a quelque chose dans hashtags, alors on vérifie si les hashtags existent dans la DB
            for (let element of req.body.hashtags) {

                Hashtag.findOne({ hashtag: element }).then(data => {

                    if (data === null) {
                        const newHashtag = new Hashtag({
                            hashtag: element
                        });

                        newHashtag.save()
                    }
                })
            }
        }

        User.findOne({ token: req.body.token }).then(data => {
            const newTweet = new Tweet({
                content: req.body.content,
                tweetDate: new Date(),
                creator: data._id,
            });

            newTweet.save().then((data) => {
                return tweetId = data._id;
            }).then((id) => {
                if (!(req.body.hashtags === null)) {
                    if (req.body.hashtags) {
                        for (let element in req.body.hashtags) {
                            Hashtag.findOneAndUpdate(
                                { hashtag: element },
                                { $push: { tweets: id } }
                            ).then((data) => res.json(data))
                        }
                    }
                }
            }
            )
        })


    }
})

router.get('/hashtags', (req, res) => {
    Hashtag.find()
        .then(data => {
            const hashtagsData = data.map(e => {
                return { hashtag: e.hashtag, tweets: e.tweets }
            })
            res.json(hashtagsData)
        })
})

module.exports = router;
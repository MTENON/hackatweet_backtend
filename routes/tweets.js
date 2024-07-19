var express = require('express');
var router = express.Router();
const { checkBody } = require('../modules/checkbody')
const moment = require('moment');

//Import des databases
const User = require('../models/User')
const Tweet = require('../models/Tweet');
const Hashtag = require('../models/Hashtags');

/* ------------------------------------------------------ */
/* -------------------- Tweets routes ------------------- */
/* ------------------------------------------------------ */


//récupérer tous les tweets pour affichage
router.get('/', (req, res) => {
    Tweet.find()
        .populate('creator')
        .then(data => {
            const sentData = data.map(e => {
                return { content: e.content, date: moment.utc(e.tweetDate).fromNow(), firstname: e.creator.firstname, username: e.creator.username, likes: e.isLikedBy.length }
            })
            res.json(sentData);
        })
});


//ajouter un tweet
//ajoute les hashtags en premier, vérifie leur existence ou non et renvoie les hashtags créés.
router.post('/newTweet', async (req, res) => {

    if (!checkBody(req.body, ['content', 'token'])) {
        res.json({ result: false, error: 'checkbody sent false' })
        return;
    }

    let isHashtag = null;
    let savedHashtags = [];
    let upddatedHashtag = null;

    //On enregistre notre utilisateur
    const userData = await User.findOne({ token: req.body.token })

    //On crée un nouveau tweet
    const newTweet = await new Tweet({
        content: req.body.content,
        tweetDate: new Date(),
        creator: userData._id,
    });

    //On enregistre ce nouveau tweet
    const savedNewTweet = await newTweet.save()

    if (!(req.body.hashtags === null)) {
        //Si il y a quelque chose dans hashtags, alors on vérifie si les hashtags existent dans la DB
        for (let element of req.body.hashtags) {

            isHashtag = await Hashtag.findOne({ hashtag: element })

            if (isHashtag === null) {

                const newHashtag = await new Hashtag({
                    hashtag: element,
                    tweets: savedNewTweet._id
                });

                savedHashtags.push(await newHashtag.save())
            } else {
                upddatedHashtag = await Hashtag.updateOne({ hashtag: element }, { $push: { tweets: savedNewTweet._id } })
            }
        }
    }
    //On ajoute le tweet dans le hashtag
    res.json({ userData: userData, savedTweet: savedNewTweet, isHashtag: isHashtag, savedHashtags: savedHashtags, upddatedHashtag: upddatedHashtag })

})

//Deletion d'un tweet
router.delete('/deleteTweet', async (req, res) => {

    if (!checkBody(req.body, ['content', 'token'])) {
        res.json({ result: false, error: 'checkbody sent false' })
        return;
    }

    const creatorData = await User.findOne({ token: req.body.token });
    const deletedTweet = await Tweet.deleteOne({ content: req.body.content, creator: creatorData._id });

    res.json(deletedTweet);

})

/* ------------------------------------------------------ */
/* --------------------- Like routes -------------------- */
/* ------------------------------------------------------ */

router.post('/like', async (req, res) => {
    if (!checkBody(req.body, ['content', 'creatorusername', 'token'])) {
        res.json({ result: false, error: 'checkbody sent false' })
        return;
    }

    const userData = await User.findOne({ token: req.body.token }) //userData._id nous interesse
    const creatorData = await User.findOne({ username: req.body.creatorusername }) //creatorData._id
    const updateTweet = await Tweet.updateOne(
        { content: req.body.content, creator: creatorData._id },
        { $push: { isLikedBy: userData._id } }
    )
    res.json({ updateTweet })
})

router.delete('/unLike', async (req, res) => {
    if (!checkBody(req.body, ['content', 'creatorusername', 'token'])) {
        res.json({ result: false, error: 'checkbody sent false' })
        return;
    }

    const userData = await User.findOne({ token: req.body.token });
    const creatorData = await User.findOne({ username: req.body.creatorusername }); //creatorData._id
    // const tweetData = await Tweet.findOne({ content: req.body.content, creator: creatorData._id });

    // const newLike = await tweetData.isLikedBy.filter(e => !e.equals(userData._id));

    const newLike = await Tweet.updateOne(
        { content: req.body.content, creator: creatorData._id },
        { $pull: { isLikedBy: userData._id } }
    )

    res.json(newLike)

    // res.json({ id: userData._id, tweetData: tweetData.isLikedBy, newlike: newLike, compare: newLike[0].equals(userData._id) });

})

/* ------------------------------------------------------ */
/* ------------------- Hashtags routes ------------------ */
/* ------------------------------------------------------ */

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
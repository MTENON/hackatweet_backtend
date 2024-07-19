var express = require("express");
var router = express.Router();
const { checkBody } = require("../modules/checkbody");
const User = require("../models/User");
const mongoose = require("mongoose");

const bcrypt = require("bcrypt");
const uid2 = require("uid2");

/* GET users listing. */
router.get("/test", (req, res) => {
  res.json({});
});

router.post("/signup", (req, res) => {
  if (!checkBody(req.body, ["firstname", "username", "password"])) {

    res.json({ result: false, error: "Missing or empty fields" });
    return;

  } else {

    User.findOne({ username: req.body.username }).then((data) => {
      if (data === null) {
        const newUser = new User({
          firstname: req.body.firstname,
          username: req.body.username,
          password: bcrypt.hashSync(req.body.password, 10),
          token: uid2(32),
        });

        newUser.save().then((data) => {
          res.json({ result: true, token: data.token });
        });

      } else {
        // User already exists in database
        res.json({ result: false, error: "User already exists" });

      }
    });
  }
});

//CETTE ROUTE PERMET DE SE LOGIN
//NECESSITE USERNAME & PASSWORD
router.post("/signin", (req, res) => {
  //CHECKBODY
  //ON VERIFIE QUE NOTRE BODY EXISTE
  if (!checkBody(req.body, ["username", "password"])) {
    //SI AU MOINS UN ELEMENT DU BODY N'EST PAS CONFORME
    res.json({ result: false, error: "Missing or empty fields" }); //ON RENVOIE FAUX
    return; //ON QUITTE LA ROUTE
  } else {
    //SI LE BODY EST OK

    //1 - ON CHERCHE NOTRE USERNAME --------------
    User.findOne({ username: req.body.username }).then((data) => {
      if (data === null) {
        //SI ON NE TROUVE RIEN DANS LA DDB

        // User already exists in database
        res.json({ result: false, error: "User doesn't exists" }); //ON RENVOIE FAUX AU FRONT
      } else {
        //2 - SI ON TROUVE LE USER ON DOIT VERIFIER LE MOT DE PASSE - ATTENTION LE MDP EST BCRYPT

        //ON VÉRIFIE SI LE MDP CORRESPOND AU MDP ENCRYPTE
        bcrypt.compareSync(req.body.password, data.password) //LE MDP CRYPTE EST IL CORRESPONDANT AU BODY PASSWORD?
          ? res.json({ result: true, token: data.token, firstname: data.firstname }) //SI VRAI ON RENVOIE TRUE ET LE TOKEN
          : res.json({ result: false, error: "Wrong password" }); //SI FAUX ON RENVOIE UNE ERROR

        //2 FIN -----------------------------------------
      }
    });
    //1 FIN -----------------------------------------
  }
});

module.exports = router;

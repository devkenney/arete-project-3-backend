const express = require("express");
const router = express.Router();
const jwt = require("jwt-simple");
const bcrypt = require("bcrypt");
const passport = require("../config/passport");
const config = require("../config/config");
const User = require("../models/user");

// Create (signup)
router.post('/signup', (req, res) => {
  console.log(req.body);
  if (req.body.username && req.body.password) {
    req.body.password = bcrypt.hashSync(
      req.body.password,
      bcrypt.genSaltSync(10)
    );

    User.findOne({
      username: req.body.username
    }, (error, user) => {
      console.log("=======findOne=======", user);
      if (!user) {
        console.log("Running create user");
        User.create(req.body, (error, createdUser) => {
          console.log('createUser', createdUser);
          console.log('error', error);
          if (createdUser) {
            let payload = {
              id: createdUser.id,
              username: createdUser.username,
              iat: Date.now()
            };
            console.log(payload);
            let token = jwt.encode(payload, config.jwtSecret);
            console.log(token);
            res.json({
              token: token
            });
          } else {
            console.log('failed to create user');
            res.sendStatus(401);
          }
        });
      } else {
        console.log('User already exists, try logging in instead!');
        res.sendStatus(401);
      }
    });
  } else {
    res.sendStatus(401);
  }
});

router.post('/login', (req, res) => {
  if (req.body.username && req.body.password) {
    console.log(req.body.username);
    User.findOne({
      username: req.body.username
    }, (error, user) => {
      if (error) console.log(error);
      if (user) {
        console.log('Found user. Checking Password...');
        if (bcrypt.compareSync(req.body.password, user.password)) {
          console.log('Password correct, generating JWT...');
          let payload = {
            id: user.id,
            username: user.username,
            iat: Date.now()
          };
          let token = jwt.encode(payload, config.jwtSecret);
          console.log(token);
          res.json({
            token: token
          });
        } else {
          console.log('Wrong password.');
          res.sendStatus(401);
        }
      } else {
        console.log('Could not find user, try signing up!');
        res.sendStatus(401);
      }
    });
  } else {
    res.sendStatus(401);
  }
});

router.put('/favorites', (req, res) => {
  User.findById(req.body.id, (error, foundUser) => {
    if (error) {
      res.send(error);
    } else if (foundUser.favorites.includes(req.body.newFav)) {
      res.status(500).json({
        error: "favorite already exists"
      });
    } else {
      User.findByIdAndUpdate(req.body.id, {
        $push: {
          favorites: req.body.newFav
        }
      }, (error) => {
        if (error) {
          res.send(error);
        }
      });
      User.findById(req.body.id, (error, foundUser) => {
        res.status(200).json({
          favorites: foundUser.favorites
        });
      });
    }
  });
});

router.get('/favorites', (req, res) => {
  const decodedUser = jwt.decode(req.body.token, config.jwtSecret);
  User.findById(decodedUser.id, (error, foundUser) => {
    if (error) {
      res.status(500);
    } else {
      res.send(foundUser.favorites);
    }
  })
})

module.exports = router;
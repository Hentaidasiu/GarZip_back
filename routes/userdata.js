const passport = require('passport');
const express = require('express');
var router = express.Router();
const User = require('../models/user');
const { default: mongoose } = require('mongoose');


router.post("/", async function (req, res) {
  // console.log(req.session)
  // console.log(req.isAuthenticated())
  if (!req.body.username) {
    res.status(404).send("username required.")
    return 0;
  }
  const user = await User.aggregate([
    {
      $match: {
        username: req.body.username
      }
    },
    {
      $project: {
        "salt": 0,
        "hash": 0
      }
    }
  ])
  if (user[0] == undefined) {
    res.status(404).send("user doesn't exist.")
  } else {
    res.status(200).send(user)
  }
})

router.put("/username", async function (req, res) {
  if (!req.body.id) {
    res.status(404).send("user id required.")
    return 0;
  }
  if (!req.body.username) {
    res.status(404).send("new username required.")
    return 0;
  }

  await User.updateOne(
    { _id: req.body.id },
    { $set: { username: req.body.username } },
    { new: true }
  ).catch((err) => {
    console.log('Error: ' + err);
    res.status(404).send("wrong username or this username was already taken.")
  });
  res.sendStatus(200)
})

router.put("/email", async function (req, res) {
  if (!req.body.id) {
    res.status(404).send("user id required.")
    return 0;
  }
  if (!req.body.email) {
    res.status(404).send("new email required.")
    return 0;
  }

  await User.updateOne(
    { _id: req.body.id },
    { $set: { email: req.body.email } },
    { new: true }
  ).catch((err) => {
    console.log('Error: ' + err);
    res.status(404).send("Error, please try again later.")
  });
  res.sendStatus(200)
})

router.put("/all", async function (req, res) {
  // console.log(req.body.data)
  if (!req.body.data.id) {
    // console.log("fail")
    res.status(404).send("user id required.")
    return 0;
  }

  if (req.body.data.username !== '') {
    await User.updateOne(
      { _id: req.body.data.id },
      { $set: { username: req.body.data.username } },
      { new: true }
    ).catch((err) => {
      console.log('Error: ' + err);
      res.status(404).send("Error, please try again later.")
    });
  }

  if (req.body.data.email !== '') {
    await User.updateOne(
      { _id: req.body.data.id },
      { $set: { email: req.body.data.email } },
      { new: true }
    ).catch((err) => {
      console.log('Error: ' + err);
      res.status(404).send("Error, please try again later.")
    });
  }
  res.sendStatus(200)
})

router.put("/password", async function (req, res) {
  // console.log(req.body.data)
  if (!req.body.data.id) {
    res.status(404).send("not enough data.")
    return 0;
  }
  else if (!req.body.data.oldpassword) {
    res.status(404).send("not enough data.")
    return 0;
  }
  else if (!req.body.data.newpassword) {
    res.status(404).send("not enough data.")
    return 0;
  }
  else if (!req.body.data.confirm_newpassword) {
    res.status(404).send("not enough data.")
    return 0;
  }
  else if (req.body.data.newpassword != req.body.data.confirm_newpassword) {
    res.send("confirm password incorrect").status(404)
    return 0;
  }
  let targetuser = await User.findOne({ _id: req.body.data.id });
  targetuser.changePassword(req.body.data.oldpassword, req.body.data.newpassword, async function (err) {
    if (err) {
      res.status(404).send("Error : " + err)
    }
    await targetuser.save()
    res.sendStatus(200)
  });
})

router.post('/changemode', async function (req, res) {
  // console.log(req.body.mode)
  var myboolean = new Boolean()
  if (req.body.mode === 'true') {
    myboolean = false
  } else {
    myboolean = true
  }
  await User.updateOne(
    { _id: req.body.id },
    { $set: { mode: myboolean } },
  ).then(
    res.send(myboolean)
  ).catch((err) => {
    console.log('Error: ' + err);
    res.status(404).send("Error, please try again later.")
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  else {
    res.status(403).send("Authentication required.")
  }
}

router.get("/app/:id", async function (req, res) {
  // console.log(req.params.id)
  User.find({ _id: req.params.id }, (err, docs) => {
    if (!err) {
      // console.log(docs)
      res.send(docs)
    } else
      console.log('Error #5 : ' + JSON.stringify(err, undefined, 2))
  })
})

module.exports = router;
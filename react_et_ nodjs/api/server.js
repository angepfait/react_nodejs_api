/* ************************** Imports **********************************/
var express = require("express");
var bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");
var cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
//var expressJwt = require('express-jwt');

/************************* Instantiate server *************************/
var server = express();

/************************** code secret du jwt*************************/
const SECRET =
  "sdfghjsdfghjdfghjklsdfghjklklsdfghjkfghsdfghdftgyzertqsdfghjkfghjk";

/************************* mildelward configuration ********************/
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(cors());
//server.use(expressJwt({ secret: SECRET , algorithms: ['HS256']}).unless({path: ['/login']}));

/************************** controle pour login et register***************/
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX = /^(?=.*\d).{4,8}$/;

/******************** ORM mangoose configuration ******************/
//const mogopath="mongodb+srv://angepfait:ange2412@cluster0.ocsvo.mongodb.net/dbase?retryWrites=true&w=majority";
const mogopath =
  "mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false";
mongoose.connect(mogopath, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "we are not connected"));
db.once("open", function () {
  console.log(" we are connected on your db!");
});
/*********model mongoose****************/
const userSchema = mongoose.Schema({
  email: String,
  password: String,
});
const User = mongoose.model("users", userSchema);

/********************************* routes********************************/
/*server.get('/protected',
  jwt({ secret: SECRET, algorithms: ['HS256'] }),
  function(req, res) {
    if (!req.user) return res.sendStatus(401);
    res.sendStatus(200);
});*/
server.get("/protected", (req, res) => {
  console.log("req.user", req.user);
});
/******************suprimer un utilisateur****************/
server.delete("/users_delete/:id", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  const id = req.params.id;
  /********methode findByIdAndRemove de mongoose**********/
  User.findByIdAndRemove(id, (err, user) => {
    if (err) {
      console.error("user is not delete");
      res.sendStatus(500);
    } else {
      return res.sendStatus(202);
    }
  });
});

/*******************voir info d'un utilisateur**********/
server.get("/user_edit/:id", (req, res) => {
  //res.setHeader('Content-Type', 'text/html');
  const id = req.params.id;
  //console.log(id);
  User.findById(id, (err, user) => {
    if (err) {
      console.log(err);
      res.send(500);
    } else {
      res.status(202).json({ user: user });
    }
  });
});
/*********************modifier**********************/
server.put("/users_put/:id", (req, res) => {
 // res.setHeader('Content-Type', 'text/html');
  if (!req.body) {
    return res.sendStatus(500);
  }
  const id = req.params.id;
  /********methode findByIdAndUpdate de mongoose**********/
  User.findByIdAndUpdate(
    id,
    { $set: { email: req.body.email, password: req.body.password } },
    { new: true },
    (err, user) => {
      if (err) {
        console.log(err);
        res.send(500);
      } else {
        return res.status(202).json({ datasend: user });
      }
    }
  );
  // console.log(req.body.email);
});
/****************liste des utilisateur*********/
server.get("/users", (req, res) => {
  //res.setHeader("Content-Type", "text/html");
  /********methode find de mongoose**********/
  User.find((err, senddata) => {
    if (err) {
      console.error("could not receved data from db");
      res.sendStatus(500);
    } else {
      return res.status(200).json({ datasend: senddata });
    }
  });
});

/******************authentification***********************/
server.post("/login", (req, res) => {
  var data = {
    email: req.body.email,
    password: req.body.password,
  };
  if (data.email == null || data.password == null) {
    return res.status(400).json({ error: "champs vide" });
  } else if (data.email === "ange@gmail.com" && data.password === "ange2412") {
    var token = jwt.sign(
      {
        Email: data.email,
        nom: "kouadio",
        prenom: "kouassi",
        nee: "24-6-199",
      },
      SECRET,
      {
        expiresIn: "1h",
      }
    );
    res.status(200).json({
      token,
    });
  } else {
    return res.status(400).json({ error: "l utilisateur n exite pas" });
  }
});
/************enregistrement d'utilisateur*******/
server.post("/register", (req, res) => {
  // Params
  var register = {
    email: req.body.email,
    password: req.body.password,
  };
  if (register.email == null || register.password == null) {
    return res.status(400).json({ error: "chapms vide" });
  }
  if (!EMAIL_REGEX.test(register.email)) {
    return res.status(400).json({ error: "email invalide" });
  }
  if (!PASSWORD_REGEX.test(register.password)) {
    return res.status(400).json({
      error: "mot de passe invalide (longeur 4 - 8 caraters avec des chiffres)",
    });
    4;
  }
  if (
    PASSWORD_REGEX.test(register.password) &&
    EMAIL_REGEX.test(register.email)
  ) {
    res.status(200).json({ success: "enregistrer avec success" });
    /**********instance de model mangoose**********/
    const email = register.email;
    const password = register.password;
    const dataUsers = new User({
      email: email,
      password: password,
    });
    dataUsers.save((err, saveduser) => {
      if (err) {
        console.error(err);
      } else {
        console.log("enregistrement", saveduser);
        //res.sendStatus(201)
      }
    });
  }
});

/**********************************Launch server*********************/
server.listen(4000, function () {
  console.log("Server en écoute sur le port 4000:)");
});

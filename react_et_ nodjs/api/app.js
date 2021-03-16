const mongoose = require("mongoose");

const mogopath =
  "mongodb+srv://angepfait:ange2412@cluster0.ocsvo.mongodb.net/dbase?retryWrites=true&w=majority";
mongoose.connect(mogopath, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "we are not connected"));
db.once("open", function () {
  console.log(" we are connected!");
});

const userShema = mongoose.Schema({
  firstname: String,
  lastname: String,
});
const User = mongoose.model("user", userShema);
const name = "ange";
const username = "parfait";

const dataUsers = new User({
  firstname: name,
  lastname: username,
});
dataUsers.save((err, saveduser) => {
  if (err) {
    console.error(err);
  } else {
    console.log("enregistrement", saveduser);
  }
});

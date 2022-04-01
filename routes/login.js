var express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();

var router = express.Router();
const app = express();

const User = require("../models/userModel");

const dbURI = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PASSWORD}@cluster0.f0vll.mongodb.net/userLoginDB?retryWrites=true&w=majority`;

mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => console.log("connected to mongoDb" + result))
  .catch((err) => console.log(err));

router.get("/", function (req, res, next) {
  res.render("login");
});

router.post("/sign_up", (req, res, next) => {
  // try {
  //   const salt = await bcrypt.genSalt();
  //   const hashedPassword = await bcrypt.hash(req.body.password, salt);
  //   const user = new User({ email: req.body.email, password: hashedPassword });
  //   user
  //     .save()
  //     .then((result) => res.status(200).send(result))
  //     .catch((err) => res.status(500).send());
  // } catch (error) {
  //   res.status(500).send();
  // }

  bcrypt
    .genSalt()
    .then((result) => {
      bcrypt
        .hash(req.body.password, result)
        .then((result) => {
          const user = new User({
            email: req.body.email,
            password: result,
          });
          user
            .save()
            .then((result) => res.status(200).send())
            .catch((err) => res.status(500).send());
        })
        .catch((err) =>
          console.log("Error while generating hashed password" + err)
        );
    })
    .catch((err) => console.log("Error while generating salt" + err));
});

router.post("/sign_in", async (req, res, next) => {
  const password = req.body.password;
  const email = req.body.email;

  // const { error } = validate(req.body);
  // if (error) return res.status(400).send({ message: error.details[0].message });
  try {
    const findingUser = await User.findOne({ email: email });
    if (!findingUser)
      return res.status(401).send({ message: "Invalid email or password" });

    const comparingPassword = await bcrypt.compare(
      password,
      findingUser.password
    );

    if (!comparingPassword)
      return res.status(401).send({ message: "Invalid password" });

    res.status(200).send({ message: "Login success" });
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = mongoose.model("User");
const { JWT_SECRET } = require("../keys");
const login = require("../middleware/login");

router.get("/", (req, res) => {
  res.send("Router auth script");
});
// END home page

// res is a request to the user
// req is a request from the user
// req.body - fromdan keladigan so'rovlar shunda saqlanadiimage.pngv
router.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  if (!name) {
    // status 422 qilindi aks holda 200 bo'ladi
    return res.status(422).json({ error: "ismingizni to'ldiring" });
  }

  if (!email) {
    // status 422 qilindi aks holda 200 bo'ladi
    return res.status(422).json({ error: "emailingizni to'ldiring" });
  }

  // Emailni to'g'ri kiritilganini tekshiradi | regex for email
  if (
    !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      email
    )
  ) {
    return res.status(422).json({ error: "email noto'g'ri kiritildi" });
  }

  if (!password) {
    // status 422 qilindi aks holda 200 bo'ladi
    return res.status(422).json({ error: "parolingizni to'ldiring" });
  }

  // email bir xil bo'lib qolganda hatolik beradi. quyidagi ko'd ishga tushadi
  User.findOne({ email: email.toLowerCase() }).then((saveUser) => {
    // email to'g'ri keladigan ma'lumotni qabul qiladi
    if (saveUser) {
      return res.status(422).json({ error: "Bu email nomi band" });
    }

    // Agar email takrorlanmagan bo'lsa quyidagi ko'd ishga tushib ma'lumot saqlanadi
    // bcrypt passwordni hafvsiz qiladi ya'ni tushinarsiz belgilarga o'zgartiradi
    bcrypt.hash(password, 10).then((hashedPass) => {
      // o'zgargan password hashedPassga saqlandi va passwordga tenglashtirildi
      const user = new User({
        email: email.toLowerCase(),
        name,
        password: hashedPass,
      });

      user
        .save()
        .then((user) => {
          res.json({ msg: "Ro'yhatdan o'tdingiz" });
        })
        .catch((err) => {
          console.log(err);
          res.json(err);
        });
    });
  });
});
// END signup

router.post("/signin", (req, res) => {
  // email borligini tekshirildi
  const { email, password } = req.body;
  if (!email) {
    return res.status(422).json({ error: "Email kiriting" });
  }
  // password borligini tekshirildi
  if (!password) {
    return res.status(422).json({ error: "Parol kiriting" });
  }
  // Emailni to'g'ri kiritilganini tekshiradi | regex for email
  if (
    !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      email
    )
  ) {
    return res.status(422).json({ error: "email noto'g'ri kiritildi" });
  }

  User.findOne({ email: email }).then((savedUser) => {
    if (!savedUser) {
      return res.status(422).json({ error: "xato email" });
    }

    // user kiritilgan password ma'lumotlar bazasidagi hashlangan password bilan solishtiradi. bolean natija qaytaradi
    bcrypt
      .compare(password, savedUser.password)
      .then((doMatch) => {
        if (doMatch) {
          // user ma'lumotlarini frontendga yuboradi
          const { _id, name, email } = savedUser;
          // signin bo'lganda userni id si jwt id siga tenglashtirildi
          const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET);
          res.json({ token, user: { _id, name, email } }); //  res.json({token: token})
        } else {
          return res.status(422).json({ error: "Parol Xato" });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
});
// END signin

module.exports = router;

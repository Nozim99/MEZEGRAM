const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const login = require("../middleware/login");
const Post = mongoose.model("Post");
const User = mongoose.model("User");

// userni o'ziga tegishli ma'lumotlarni jo'natadi
router.get("/selfUserData", login, (req, res) => {
  User.findById(req.user._id)
  // passwordni junatmaydi
    .select("-password")
    .then(user => {
      res.json({ user })
    })
    .catch(err => console.log(err))
})

// Postdagi user name qismiga bossa bosilgan user profiliga o'tib unga tegishli postlarni qaytaradi. Quyidagi shu bosilgan userni postini qaytaradi
router.get("/user/:id", login, (req, res) => {
  // params.id buni routerga yozilgan /:id dan oladi
  // user id raqamini serverdan qidiradi
  User.findOne({ _id: req.params.id })

    // userni password ma'lumotini jo'natmaydi
    .select("-password")
    .then((user) => {
      Post.find({ postedBy: req.params.id })
        // postedBy dagi ma'lumotda _id va name ma'lumotini qaytaradi. Bu yozilmasa _id raqamini o'zini qaytaradi
        .populate("postedBy", "_id, name")

        // Topilgan ma'lumotni qaytaradi
        .exec((err, posts) => {
          if (err) return res.status(422).json({ error: err });

          // user ma'lumotlarini va posts ma'lumotini qaytaradi
          res.json({ user, posts });
        });
    })

    // Agar foydalanuvchi id raqami topilmasa quyidagi xatoni qaytaradi
    .catch((err) => {
      return res
        .status(404) // 404 - not found
        .json({ error: "Foydalanuvchi topilmadi. Error:", err });
    });
});

// follow qilish
router.put("/follow", login, (req, res) => {
  // follow bosgan userga follower qo'shadi
  // User.findByIdAndUpdate(
  //   req.body.followId,
  //   {
  //     // follow bosgan userga tegishli followers ma'lumotiga userni id raqami qo'shiladi
  //     $addToSet: { "follow.followers": req.user._id },
  //   },
  //   // yangiligini bildiradi
  //   { new: true },
  //   // to'rtinchi argumentiga funksiya yoziladi, birinchisi xato qaytaradi (err) ikkinchisi qo'shilgan elementni qaytaradi (result)
  //   (err, resultt) => {
  //     if (err) {
  //       return res.status(422).json({ error: err });
  //     }

  //     // Yuqoridagi xatosiz ishlasa follow bosgan userga followinglari bittaga ko'payadi
  //     User.findByIdAndUpdate(
  //       req.user._id,
  //       {
  //         // following ma'lumotlariga follow bosgan user id raqami saqlanadi
  //         $addToSet: { "follow.following": req.body.followId },
  //       },
  //       { new: true }
  //     )
  //       // password ma'lumotini yubormaydi
  //       .select("-password")
  //       // resultda userni o'zini ma'lumotlari saqlanadi. follow bosgan userni ma'lumoti qaytarilmidi aks holda sir saqlanish kerak bo'lgan ma'lumotlar tarqalib ketishi mumkin
  //       .then((result) => res.json({ result, resultt }))
  //       .catch((err) => {
  //         return res.status(422).json({ error: err });
  //       });
  //   }
  // );

  User.findByIdAndUpdate(
    req.body.followId,
    {
      // follow bosgan userga tegishli followers ma'lumotiga userni id raqami qo'shiladi
      $addToSet: { "follow.followers": req.user._id },
    },
    // yangiligini bildiradi
    { new: true },
    // to'rtinchi argumentiga funksiya yoziladi, birinchisi xato qaytaradi (err) ikkinchisi qo'shilgan elementni qaytaradi (result)
    (err) => {
      if (err) {
        return res.status(422).json({ error: err });
      }

      // Yuqoridagi xatosiz ishlasa follow bosgan userga followinglari bittaga ko'payadi
      User.findByIdAndUpdate(
        req.user._id,
        {
          // following ma'lumotlariga follow bosgan user id raqami saqlanadi
          $addToSet: { "follow.following": req.body.followId },
        },
        { new: true }
      )
        // password ma'lumotini yubormaydi
        .select("-password")
        // resultda userni o'zini ma'lumotlari saqlanadi. follow bosgan userni ma'lumoti qaytarilmidi aks holda sir saqlanish kerak bo'lgan ma'lumotlar tarqalib ketishi mumkin
        .then((result) => res.json({ result }))
        .catch((err) => {
          return res.status(422).json({ error: err });
        });
    }
  );
});

// unfollow qilish
router.put("/unfollow", login, (req, res) => {
  // follow bosgan userni follower ma'lumoti kamayadi
  User.findByIdAndUpdate(
    // follow bosgan user id raqami
    req.body.unfollowId,
    {
      // unfollow bosgan userga tegishli followers ma'lumotidan userni id raqami o'chiriladi
      $pull: { "follow.followers": req.user._id },
    },
    // yangiligini bildiradi
    { new: true },
    // to'rtinchi argumentiga funksiya yoziladi, birinchisi xato qaytaradi (err) ikkinchisi qo'shilgan elementni qaytaradi (result)
    (err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      }
      // Yuqoridagi xatosiz ishlasa unfollow bosgan userga followinglari bittaga kamayadi
      User.findByIdAndUpdate(
        // userga tegishli id raqam
        req.user._id,
        {
          // following ma'lumotlariga follow bosgan user id raqami o'chiriladi
          $pull: { "follow.following": req.body.unfollowId },
        },
        // yangiligini bildiradi
        { new: true }
      )
        // password ma'lumotini yubormaydi
        .select("-password")
        // resultda userni o'zini ma'lumotlari saqlanadi. follow bosgan userni ma'lumoti qaytarilmidi aks holda sir saqlanish kerak bo'lgan ma'lumotlar tarqalib ketishi mumkin
        .then((result) => res.json(result))
        .catch((err) => {
          return res.status(422).json({ error: err });
        });
    }
  );
});

module.exports = router;

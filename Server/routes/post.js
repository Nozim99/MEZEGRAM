const { Router } = require("express");
const router = Router();
const mongoose = require("mongoose");
const login = require("../middleware/login");
const Post = mongoose.model("Post");
const User = mongoose.model("User")

// LOGIN MIDDLEWARE
// post yaratish uchun ro'yhatdan o'tgan bo'lishi kerak shuning uchun login middlewaredan foydalandi
// login vazifasi user ro'yhatdan o'tmagan bo'lsa 401 xatosi va "Ro'yhatdan o'tgandan keyin" xabarini qaytaradi

// Barcha postlarni frontendga yuboradi
router.get("/allpost", login, (req, res) => {
  Post.find()
    .populate("postedBy", "_id, name")
    .populate("comments.postedBy", "_id, name")
    .then((posts) => {
      res.json({ posts });
    })
    .catch((err) => {
      console.log(err);
    });
});

// Post yaratadi
router.post("/createpost", login, (req, res) => {
  const { title, body, pic } = req.body;

  if (!title) {
    return res.status(422).json({ error: "Sarlavhani to'ldiring" });
  }
  if (!body) {
    return res.status(422).json({ error: "Tavsif yozing" });
  }
  if (!pic) {
    return res.status(422).json({ error: "Rasm qo'shing" });
  }

  req.user.password = undefined;

  const post = new Post({
    title,
    body,
    photo: pic,
    postedBy: req.user,
  });

  post
    .save()
    .then((result) => {
      res.json({ post: result });
    })
    .catch((err) => {
      console.log(err);
    });
});

// Userlarni o'zi yaratgan postlarni qaytaradi
router.get("/mypost", login, (req, res) => {
  Post.find({ postedBy: req.user._id })

    // .populate orqali faqat kerakli ma'lumotlarni qaytaradi. Quyidagi ma'lumotlar bir obyekti ichida keladi
    // comments massividagi postedBy obyektidan faqat _id va name ma'lumotini qaytaradi
    .populate("comments.postedBy", "_id, name")

    // faqat id va name ma'lumotini qaytaradi
    .populate("postedBy", "_id, name")
    .then((myPost) => {
      res.json({ myPost });
    })
    .catch((err) => {
      console.log(err);
    });
});

// Like bosish funksiyasi
router.put("/like", login, (req, res) => {
  Post.findByIdAndUpdate(req.body.postId, {
    // $push - massivga element qo'shadi. massivda o'xshash elementlar takrorlansa ham qo'shadi. ox'shash elementlar takrorlanishi mumkin
    // $addToSet - massivga element qo'shadi. Bir xil narsa qo'shmidi. massivda bor ma'lumotga o'xshash ma'lumot qo'shmidi. unique bo'lishini ta'minlaydi
    // Post moduldagi likes ga userga tegishli id qo'shiladi
    $addToSet: { likes: req.user._id },

    // like bosilganda dislike bosilgan bo'lsa bekor qiladi
    $pull: { dislikes: req.user._id },
  }).exec(function (err, result) {
    if (err) {
      // 422 Unprocessable Entity. 422 Ishlov berilmaydigan obyekt
      return res.status(422).json({ error: err });
    } else {
      return res.json(result);
    }
  });
});

// Bosgan likeni bekor qilish
router.put("/nolike", login, (req, res) => {
  Post.findByIdAndUpdate(req.body.postId, {
    // pull - massivda mos kelgan elementlarni o'chiradi
    // Post moduldagi likes dan userga tegishli id o'chiriladi
    $pull: { likes: req.user._id },
    // {
    //   new: true
    // }
  }).exec((err, result) => {
    if (err) {
      // 422 Unprocessable Entity. 422 Ishlov berilmaydigan ob'ekt
      return res.status(422).json({ error: err });
    } else {
      return res.json(result);
    }
  });
});

// Dislike bosish funksiyasi
router.put("/dislike", login, (req, res) => {
  Post.findByIdAndUpdate(req.body.postId, {
    // $push - massivga element qo'shadi. massivda o'xshash elementlar takrorlansa ham qo'shadi. ox'shash elementlar takrorlanishi mumkin
    // $addToSet - massivga element qo'shadi. Bir xil narsa qo'shmidi. massivda bor ma'lumotga o'xshash ma'lumot qo'shmidi. unique bo'lishini ta'minlaydi
    // Post moduldagi likes ga userga tegishli id qo'shiladi
    $addToSet: { dislikes: req.user._id },

    // Dislike qo'shilganda like bosilgan bo'lsa bekor qilinadi
    $pull: { likes: req.user._id },
    // {
    //   new: true
    // }
  }).exec((err, result) => {
    if (err) {
      // 422 Unprocessable Entity. 422 Ishlov berilmaydigan ob'ekt
      return res.status(422).json({ error: err });
    } else {
      return res.json(result);
    }
  });
});

// Bosgan Dislikeni bekor qilish
router.put("/nodislike", login, (req, res) => {
  Post.findByIdAndUpdate(req.body.postId, {
    // pull - massivda mos kelgan elementlarni o'chiradi
    // Post moduldagi likes dan userga tegishli id o'chiriladi
    $pull: { dislikes: req.user._id },
    // {
    //   new: true
    // }
  }).exec((err, result) => {
    if (err) {
      // 422 Unprocessable Entity. 422 Ishlov berilmaydigan ob'ekt
      return res.status(422).json({ error: err });
    } else {
      return res.json(result);
    }
  });
});

// Komment yozish
router.put("/comments", login, (req, res) => {
  if (!req.body.text) return;

  const comment = {
    text: req.body.text,
    postedBy: req.user._id,
  };
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { comments: comment },
    },
    { new: true }
  )
    // .populate orqali faqat kerakli ma'lumotlarni qaytaradi. Quyidagi ma'lumotlar bir obyekti ichida keladi
    // comments massividagi postedBy obyektidan faqat _id va name ma'lumotini qaytaradi
    .populate("comments.postedBy", "_id, name")
    // postedBy obyektida faqa _id va name ma'lumotini qaytaradi
    .populate("postedBy", "_id, name")
    .exec((err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      } else {
        return res.json(result);
      }
    });
});

// Kommentni o'chirish
router.delete("/deletepost/:postId", login, (req, res) => {
  Post.findById({ _id: req.params.postId })
    .populate("postedBy", "_id")
    .exec((err, post) => {
      if (err || !post) return res.status(422).json({ error: err });

      // id raqamini tekshirishda hatolik bo'lmasligi uchun ikkalasi ham stringga o'tkazildi
      if (post.postedBy._id.toString() === req.user._id.toString())
        post
          .remove()
          .then((result) => {
            res.json(result);
          })
          .catch((err) => console.log(err));
    });
});

// follow berilgan userlarni postlarini jo'natadi
router.get("/getsubspost", login, (req, res) => {
  User.findById(req.user._id)
  .then(result => {
    // res.json(result.follow.followers)
    Post.find({postedBy: {$in: result.follow.followers}})
    .then(data=>res.json(data))
  })


  // $in req.user.following ichidagi har bir id raqamlarni belgilaydi. req.user.following dagi id raqamlariga teng postlarni qaytaradi
  // Post.find({ postedBy: { $in: req.user.following } })
  //   .populate("postedBy", "_id, name")
  //   .then(posts => res.json({ posts }))
  //   .catch(err => console.log(err))
})

module.exports = router;

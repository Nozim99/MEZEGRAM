const { Schema, model } = require("mongoose");
const { ObjectId } = Schema.Types;

const postSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    required: true,
  },
  Date: {
    type: Date,
    default: new Date(),
  },
  likes: [
    {
      // Bu yerga obyekt yoziladi. mongoose tomonidan beriladigan _id
      type: ObjectId,
      // User nomli moduldan ma'lumot olish uchun ishlatilinadi
      ref: "User",
    },
  ],
  dislikes: [
    {
      // Bu yerga obyekt yoziladi. mongoose tomonidan beriladigan _id
      type: ObjectId,
      // User nomli moduldan ma'lumot olish uchun ishlatilinadi
      ref: "User",
    },
  ],
  comments: [
    {
      text: String,
      postedBy: {
        // Bu yerga obyekt yoziladi. mongoose tomonidan beriladigan _id
        type: ObjectId,
        // User nomli moduldan ma'lumot olish uchun ishlatilinadi
        ref: "User",
      },
    },
  ],
  postedBy: {
    // Bu yerga obyekt yoziladi. mongoose tomonidan beriladigan _id
    type: ObjectId,
    // User nomli moduldan ma'lumot olish uchun ishlatilinadi
    ref: "User",
  },
});

model("Post", postSchema);

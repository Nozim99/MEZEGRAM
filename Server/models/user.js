const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,

    // email nomi faqat bitta bo'lishini bildiradi
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  follow: {
    followers: [
      {
        // Mongodb tomonidan beriladigan id turi
        type: Schema.Types.ObjectId,
        ref: "User",
        unique: true,
      },
    ],
    following: [
      {
        // Mongodb tomonidan beriladigan id turi
        type: Schema.Types.ObjectId,
        ref: "User",
        unique: true,
      },
    ],
  },
});

model("User", userSchema);

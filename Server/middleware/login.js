// Foydalanuvchilar login qilganini tekshirish
// Foydalanuvchi ulanganini aniqlovchi middleware

const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../keys");
const mongoose = require("mongoose");
const User = mongoose.model("User");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  // Ro'yhatdan o'tmagan uchun quyidagi hatolikni qaytaradi
  if (!authorization) {
    return res.status(401).json({ error: "Ro'yhatdan o'tgandan keyin" });
  }

  //  "MEZES token" ko'rinishida yoziladi
  const token = authorization.replace("MEZES ", "");
  // verify(token, secretKey, function)
  jwt.verify(token, JWT_SECRET, (err, payload) => {
    // biror hatolik yuz bersa quyidagi ko'd ishlaydi
    if (err) {
      return res.status(401).json({ error: "Hato yuz berdi. Keyinroq urunib ko'ring" });
    }

    // payloadga login bo'lgan paytdagi berilgan ma'lumotlar saqlanadi
    const { _id } = payload;

    // ma'lumotlar bazasida _id ga mos ma'lumotlar topilib foydalanuvchiga jo'natiladi. Frontendda bu ma'lumotlardan foydalaniladi
    User.findById(_id).then((userData) => {
      req.user = userData;
      next();
    });
  });
};

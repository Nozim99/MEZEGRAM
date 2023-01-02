const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");

const { MONGODB_URI } = require("./keys");
const PORT = process.env.PORT || 5000;
require("./models/user");
require("./models/post");

// frontend bilan muommoni bo'ldi quyidagi orqali hatosiz ishladi
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

mongoose.connect(MONGODB_URI, { family: 4 });

// The following code is written to use the JSON file
app.use(express.json());

app.use(require("./routes/auth"));
app.use(require("./routes/post"));
app.use(require("./routes/user"));

if(process.env.NODE_ENV === "production"){
  
}

app.listen(PORT, () => {
  console.log(`Server has been started on port ${PORT}`);
});

const mongoose = require("mongoose");

require("dotenv").config();

const dbConnection = mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log(err));

module.exports = mongoose;
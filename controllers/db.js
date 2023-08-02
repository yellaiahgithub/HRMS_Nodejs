const conf = require("../conf/conf");
const mongoose = require("mongoose");

mongoose.set("strictQuery", false);
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

let uri = conf.DB_URI;

const dbConnect = async () =>
  await mongoose.connect(uri, options, () => {
    console.log("Connected to MongoDB...");
  });
module.exports = { dbConnect };

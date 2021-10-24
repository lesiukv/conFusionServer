const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require("mongoose-currency").loadType(mongoose);
const Currency = mongoose.Types.Currency;

var leaderSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  abbr: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
    required: true,
  },
  faatured: {
    type: Boolean,
    dfault: false,
  },
});

var Leaders = mongoose.model("Leaders", leaderSchema);
module.exports = Leaders;

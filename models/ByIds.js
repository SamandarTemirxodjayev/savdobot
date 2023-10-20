const mongoose = require("mongoose");

const ByIdsSchema = new mongoose.Schema({
  codeType: {
    type: String,
  },
  usedId: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now,
  },
  price: {
    type: Number
  },
  user: {
    type: String
  }
});
const ByIds = mongoose.model("byid", ByIdsSchema);

module.exports = ByIds;

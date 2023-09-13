const mongoose = require("mongoose");

const CodesSchema = new mongoose.Schema({
  codeType: {
    type: String,
  },
  code: {
    type: String,
  },
  status: {
    type: String,
    default: "0",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  usedDate:{
    type: Date,
    default: null
  },
  usedBy:{
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: "users"
  }
});
const Codes = mongoose.model("Codes", CodesSchema);

module.exports = Codes;

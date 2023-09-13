const mongoose = require("mongoose");

const DataValueSchema = new mongoose.Schema({
  tgId: {
    type: String,
  },
  value: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
const DataValue = mongoose.model("datavalue", DataValueSchema);

module.exports = DataValue;

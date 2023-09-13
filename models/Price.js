const mongoose = require("mongoose");

const PriceSchema = new mongoose.Schema({
  60: {
    type: Number,
  },
  325: {
    type: Number,
  },
  660: {
    type: Number,
  },
  1800: {
    type: Number,
  },
  3850: {
    type: Number,
  },
  8100: {
    type: Number,
  }
});
const Price = mongoose.model("price", PriceSchema);

module.exports = Price;

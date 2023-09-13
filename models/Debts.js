const mongoose = require("mongoose");

const DebtsSchema = new mongoose.Schema({
  tgId: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  codes: {
    60: {
      type: Number,
      default: 0
    },
    325: {
      type: Number,
      default: 0
    },
    660: {
      type: Number,
      default: 0
    },
    1800: {
      type: Number,
      default: 0
    },
    3850: {
      type: Number,
      default: 0
    },
    8100: {
      type: Number,
      default: 0
    }
  },
});

const Debts = mongoose.model("Debts", DebtsSchema);

module.exports = Debts;

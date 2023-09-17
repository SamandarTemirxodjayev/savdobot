const mongoose = require("mongoose");

const UsersSchema = new mongoose.Schema({
  tgId: {
    type: String,
  },
  name: {
    type: String,
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now,
  },
  balance: {
    type: Number,
    default: 0,
  }
});
const Users = mongoose.model("users", UsersSchema);

module.exports = Users;

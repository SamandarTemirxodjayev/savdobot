const express = require('express');
const mongoose = require("mongoose");
require('dotenv').config()

const app = express();

app.get('/', (req, res) => {
  res.send('bot is running!');
});

mongoose.connect("mongodb://127.0.0.1:27017/savdobot?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.9.1",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)
.then(() => {
  console.log("Database connected");
  app.listen(process.env.PORT || 3000, () => {
    console.log("Server started on port 3000");
    require("./bot.js");
  });
});
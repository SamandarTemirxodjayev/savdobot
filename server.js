const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const fs = require("fs");
const cors = require("cors");

function readJsonFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading JSON file:", err);
    return {};
  }
}

const app = express();
app.use(express.json());

app.use(cors());

app.get("/", (req, res) => {
  res.send("bot is running!");
});
app.get("/api/prices", (req, res) => {
  const price = readJsonFile("./price.json");
  res.json({ price });
});
app.put("/api/prices", (req, res) => {
  const price = req.body.price;
  fs.writeFileSync("./price.json", JSON.stringify(price));
  res.json({ price });
});

mongoose.connect("mongodb://127.0.0.1:27017/savdobot?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.9.1",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)
  .then(() => {
    console.log("Database connected");
    app.listen(process.env.PORT || 3001, () => {
      console.log("Server started on port 3001");
      require("./bot.js");
    });
  });
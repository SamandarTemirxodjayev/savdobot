"use strict";
let TelegramBot = require("node-telegram-bot-api");
const Codes = require("./models/Codes");
const DataValue = require("./models/DataValue");
const Users = require("./models/Users");
const Debts = require("./models/Debts");
const fs = require("fs");
const ByIds = require("./models/ByIds");
const pricePath = "./price.json";

function readJsonFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading JSON file:", err);
    return {};
  }
}
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const stripos = (haystack, needle) => {
  const haystackLower = haystack.toLowerCase();
  const needleLower = needle.toLowerCase();
  return haystackLower.indexOf(needleLower);
};

bot.onText(/\/start/, async (msg) => {
  const user = await Users.findOne({ tgId: msg.chat.id });
  if(!user){
    const newUser = new Users({ tgId: msg.chat.id, name: msg.chat.first_name });
    await newUser.save();
  }
  bot.sendMessage(msg.chat.id, "Hi! I'm a bot that helps you to add codes to the database.");
});

bot.on("message", async (msg) => {

  const userData = await DataValue.findOne({ tgId: msg.chat.id });
  if (userData && userData.value){
    if(stripos(userData.value, "addCodes||") !== -1){
      const codeType = userData.value.split("||")[1];
      const price = await readJsonFile(pricePath);
      const lines = msg.text.split("\n");
      for (const line of lines) {
        const code = new Codes({ codeType, code: line, price: price[codeType] });
        try {
          await code.save();
          console.log(`Saved code: ${line}`);
        } catch (error) {
          console.error(`Error saving code: ${line}, Error: ${error.message}`);
        }
      }
      await userData.deleteOne({tgId: msg.chat.id});
      bot.sendMessage(msg.chat.id, `Codes added!
Code type: ${codeType}
Quantities: ${lines.length}`);

    }
    if (userData.value == "add_user") {
      const user = await Users.findOne({ tgId: msg.text });
      console.log("User found:", user);
    
      if (!user) {
        bot.sendMessage(msg.chat.id, "User not found!");
      } else {
        user.isAdmin = true;
    
        try {
          await user.save();
          const newDebts = new Debts({
            tgId: msg.text,
            userId: user._id,
          });
          await newDebts.save();
          bot.sendMessage(msg.chat.id, "User Set as Admin!");
        } catch (error) {
          console.error("Error saving user:", error);
          bot.sendMessage(msg.chat.id, "Error setting user as admin!");
        }
      }
      await userData.deleteOne({ tgId: msg.chat.id });
    }
    if (userData.value == "delete_user") {
      const user = await Users.findOne({ tgId: msg.text });
      if (!user) {
        bot.sendMessage(msg.chat.id, "User not found!");
      } else {
        user.isAdmin = false;
    
        try {
          await user.save();
          await Debts.deleteOne({ tgId: msg.text });
          bot.sendMessage(msg.chat.id, "User deleted!");
        } catch (error) {
          console.error("Error saving user:", error);
          bot.sendMessage(msg.chat.id, "Error setting user as admin!");
        }
      }
      await userData.deleteOne({ tgId: msg.chat.id });
    }
    if(stripos(userData.value, "byid||")!== -1){
      const codeType = userData.value.split("||")[1];
      const price = await readJsonFile("./priceId.json");
      const user = await Users.findOne({ tgId: msg.chat.id });
      user.balance += price[codeType];
      await user.save();
      await userData.deleteOne({tgId: msg.chat.id});
      bot.sendMessage(msg.chat.id, `<b>Ma'lumot: 
  ID: <code>${msg.text}</code>
  UC: <code>${codeType}</code>
  PRICE: <code>${price[codeType]}</code></b>`, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🔰 GET CODE", callback_data: "get_codes" }],
            [{ text: "🔰 BY ID", callback_data: "by_id_code" }],
          ],
        }
      });
      bot.sendMessage(process.env.GROUP_ID, `<b>Ma'lumot: 
  ID: <code>${msg.text}</code>
  UC: <code>${codeType}</code>
  PRICE: <code>${price[codeType]}</code></b>`, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "✅ TASDIQLASH", callback_data: `tasdiqlash||${msg.chat.id}||${msg.text}||${codeType}` }],
            [{ text: "❌ BEKOR QILISH", callback_data: `bekorqilish||${msg.chat.id}||${msg.text}||${codeType}` }],
          ],
        }
      });

    }
  }
  const user = await Users.findOne({ tgId: msg.chat.id });
  if (msg.text == "/admin" && (msg.chat.id == process.env.ADMIN_ID || (user && user.isAdmin))) {
    const codes60 = await Codes.find({ codeType: "60", status: "0" });
    const codes325 = await Codes.find({ codeType: "325", status: "0" });
    const codes660 = await Codes.find({ codeType: "660", status: "0" });
    const codes1800 = await Codes.find({ codeType: "1800", status: "0" });
    const codes3850 = await Codes.find({ codeType: "3850", status: "0" });
    const codes8100 = await Codes.find({ codeType: "8100", status: "0" });
    const debt = await Debts.findOne({ tgId: msg.chat.id });
  
    let reply_markup = {
      inline_keyboard: [
        [{ text: "🔰 GET CODE", callback_data: "get_codes" }],
        [{ text: "🔰 BY ID", callback_data: "by_id_code" }],
        [{ text: "🎰 PRICE", callback_data: "get_price" }],
      ],
    };
  
    if (msg.chat.id == process.env.ADMIN_ID) {
      reply_markup = {
        inline_keyboard: [
          [{ text: "🔰 GET CODE", callback_data: "get_codes" }],
          [{ text: "🔰 BY ID", callback_data: "by_id_code" }],
          [{ text: "✳️ ADD CODE", callback_data: "add_codes" }],
          [{ text: "🧑‍✈️ ADMINS", callback_data: "admin_page" }],
          [{ text: "🎰 PRICE", callback_data: "get_price" }],
        ],
      };
    }
  
    bot.sendMessage(msg.chat.id, `<b>Redeem soni:
💣 60UC -  ${codes60.length} 💣
💣 325UC - ${codes325.length} 💣
💣 660UC - ${codes660.length} 💣
💣 1800UC - ${codes1800.length} 💣
💣 3850UC - ${codes3850.length} 💣
💣 8100UC - ${codes8100.length} 💣 </b>
--------------
💣 60UC -  ${debt.codes[60]} 💣
💣 325UC - ${debt.codes[325]} 💣
💣 660UC - ${debt.codes[660]} 💣
💣 1800UC - ${debt.codes[1800]} 💣
💣 3850UC - ${debt.codes[3850]} 💣
💣 8100UC - ${debt.codes[8100]} 💣

${user.balance.toFixed(2)} USDT`, {
      parse_mode: "HTML",
      reply_markup,
    });
  }
});

bot.on("callback_query", async (msg) => {
  if (msg.data == "get_codes") {
    bot.sendMessage(msg.message.chat.id, "<b>Qancha kerak ⤵️</b>", {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "1️⃣", callback_data: "redeemGive||1" },
            { text: "2️⃣", callback_data: "redeemGive||2" },
            { text: "3️⃣", callback_data: "redeemGive||3" },
          ],
          [
            { text: "4️⃣", callback_data: "redeemGive||4" },
            { text: "5️⃣", callback_data: "redeemGive||5" },
            { text: "6️⃣", callback_data: "redeemGive||6" },
          ],
          [
            { text: "7️⃣", callback_data: "redeemGive||7" },
            { text: "8️⃣", callback_data: "redeemGive||8" },
            { text: "9️⃣", callback_data: "redeemGive||9" },
          ],
          [
            { text: "🔟", callback_data: "redeemGive||10" },
            { text: "1️⃣5️⃣", callback_data: "redeemGive||15" },
            { text: "2️⃣0️⃣", callback_data: "redeemGive||20" },
          ],
          [
            { text: "5️⃣0️⃣", callback_data: "redeemGive||50" },
            { text: "100", callback_data: "redeemGive||100" },
          ],
        ],
      },
    });
  }
  if(stripos(msg.data, "redeemGive||")!= -1) {
    const quantity = msg.data.split("||")[1];
    bot.editMessageText("<b>Redeemni tanglang</b>", {
      chat_id: msg.message.chat.id,
      message_id: msg.message.message_id,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "60UC", callback_data: `promo||60||${quantity}` }],
          [{ text: "325UC", callback_data: `promo||325||${quantity}` }],
          [{ text: "385UC", callback_data: `promo||385||${quantity}` }],
          [{ text: "660UC", callback_data: `promo||660||${quantity}` }],
          [{ text: "985UC", callback_data: `promo||985||${quantity}` }],
          [{ text: "1800UC", callback_data: `promo||1800||${quantity}` }],
          [{ text: "3850UC", callback_data: `promo||3850||${quantity}` }],
          [{ text: "8100UC", callback_data: `promo||8100||${quantity}` }],
        ],
      }
    });
  }
  if(stripos(msg.data, "promo||")!= -1) {
    const quantity = msg.data.split("||")[2];
    const codeType = msg.data.split("||")[1];
    
    await bot.deleteMessage(msg.message.chat.id, msg.message.message_id);
    if(codeType == "385"){
      const check60 = await Codes.find({ codeType: "60", status: 0 });
      const check325 = await Codes.find({ codeType: "325", status: 0 });
      if(check60.length < parseInt(quantity, 10) || check325.length < parseInt(quantity, 10)){
        bot.sendMessage(msg.message.chat.id, "Yetarlicha Mavjud emas");
      }else{
        const debt = await Debts.findOne({ tgId: msg.message.chat.id });

        if (debt) {
          debt.codes[60] = (debt.codes[60] || 0) + parseInt(quantity, 10);
          debt.codes[325] = (debt.codes[325] || 0) + parseInt(quantity, 10);
          await debt.save();
        } else {
          console.log("Debt not found for tgId: " + msg.message.chat.id);
        }
        const codes = await Codes.find({ codeType: "60", status: 0 }).sort({ id: -1 }).limit(quantity);
        let text = "";
        for (const code of codes) {
          console.log(code.code);
          text += `<code>${code.code}</code> || 60 \n`;
          const savedCode = await Codes.findOne({ code: code.code, codeType: "60", status: 0 });
          const user = await Users.findOne({ tgId: msg.message.chat.id });
          user.balance += code.price;
          await user.save();
          savedCode.status = 1;
          savedCode.usedBy = debt.userId;
          savedCode.usedDate = new Date();
          await savedCode.save();
        }
        const codes325 = await Codes.find({ codeType: "325", status: 0 }).sort({ id: -1 }).limit(quantity);
        for (const code of codes325) {
          console.log(code.code);
          text += `<code>${code.code}</code> || 325\n`;
          const savedCode = await Codes.findOne({ code: code.code, codeType: "325", status: 0 });
          const user = await Users.findOne({ tgId: msg.message.chat.id });
          user.balance += code.price;
          await user.save();
          savedCode.status = 1;
          savedCode.usedBy = debt.userId;
          savedCode.usedDate = new Date();
          await savedCode.save();
        }
        bot.sendMessage(msg.message.chat.id, `${text}<b>💚 Code Type: ${codeType}
🎁 Quantity: ${quantity}</b>`, {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "🔰 GET CODE", callback_data: "get_codes" }],
            ]
          }
        });
      }
    }else if(codeType == "985"){
      const check60 = await Codes.find({ codeType: "660", status: 0 });
      const check325 = await Codes.find({ codeType: "325", status: 0 });
      if(check60.length < parseInt(quantity, 10) || check325.length < parseInt(quantity, 10)){
        bot.sendMessage(msg.message.chat.id, "Yetarlicha Mavjud emas");
      }else{
        const debt = await Debts.findOne({ tgId: msg.message.chat.id });

        if (debt) {
          debt.codes[660] = (debt.codes[660] || 0) + parseInt(quantity, 10);
          debt.codes[325] = (debt.codes[325] || 0) + parseInt(quantity, 10);
          await debt.save();
        } else {
          console.log("Debt not found for tgId: " + msg.message.chat.id);
        }
        const codes = await Codes.find({ codeType: "660", status: 0 }).sort({ id: -1 }).limit(quantity);
        let text = "";
        for (const code of codes) {
          console.log(code.code);
          text += `<code>${code.code}</code> || 660 \n`;
          const savedCode = await Codes.findOne({ code: code.code, codeType: "660", status: 0 });
          const user = await Users.findOne({ tgId: msg.message.chat.id });
          user.balance += code.price;
          await user.save();
          savedCode.status = 1;
          savedCode.usedBy = debt.userId;
          savedCode.usedDate = new Date();
          await savedCode.save();
        }
        const codes325 = await Codes.find({ codeType: "325", status: 0 }).sort({ id: -1 }).limit(quantity);
        for (const code of codes325) {
          console.log(code.code);
          text += `<code>${code.code}</code> || 325\n`;
          const savedCode = await Codes.findOne({ code: code.code, codeType: "325", status: 0 });
          const user = await Users.findOne({ tgId: msg.message.chat.id });
          user.balance += code.price;
          await user.save();
          savedCode.status = 1;
          savedCode.usedBy = debt.userId;
          savedCode.usedDate = new Date();
          await savedCode.save();
        }
        bot.sendMessage(msg.message.chat.id, `${text}<b>💚 Code Type: ${codeType}
🎁 Quantity: ${quantity}</b>`, {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "🔰 GET CODE", callback_data: "get_codes" }],
            ]
          }
        });
      }
    }else{
      const checker = await Codes.find({ codeType, status: 0 });
      if(checker.length < parseInt(quantity, 10)) {
        bot.sendMessage(msg.message.chat.id, "Yetarlicha Mavjud emas");
      }else{
        const debt = await Debts.findOne({ tgId: msg.message.chat.id });

        if (debt) {
          debt.codes[codeType] = (debt.codes[codeType] || 0) + parseInt(quantity, 10);
          await debt.save();
        } else {
          console.log("Debt not found for tgId: " + msg.message.chat.id);
        }
        const codes = await Codes.find({ codeType: codeType, status: 0 }).sort({ id: -1 }).limit(quantity);
        let text = "";
        for (const code of codes) {
          console.log(code.code);
          text += `<code>${code.code}</code>\n`;
          const savedCode = await Codes.findOne({ code: code.code, codeType, status: 0 });
          const user = await Users.findOne({ tgId: msg.message.chat.id });
          user.balance += code.price;
          await user.save();
          savedCode.status = 1;
          savedCode.usedBy = debt.userId;
          savedCode.usedDate = new Date();
          await savedCode.save();
        }
        bot.sendMessage(msg.message.chat.id, `${text}<b>💚 Code Type: ${codeType}
🎁 Quantity: ${quantity}</b>`, {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "🔰 GET CODE", callback_data: "get_codes" }],
            ]
          }
        });

      }
    }
  }
  if(msg.data == "add_codes") {
    bot.editMessageText("<b>Qo'shmoqchi bo'gan Redeem Turini Tanglang</b>", {
      chat_id: msg.message.chat.id,
      message_id: msg.message.message_id,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "60UC", callback_data: "addCodes||60" }],
          [{ text: "325UC", callback_data: "addCodes||325" }],
          [{ text: "660UC", callback_data: "addCodes||660" }],
          [{ text: "1800UC", callback_data: "addCodes||1800" }],
          [{ text: "3850UC", callback_data: "addCodes||3850" }],
          [{ text: "8100UC", callback_data: "addCodes||8100" }],
        ],
      }
    });
  }
  if(stripos(msg.data, "addCodes||")!= -1) {
    const codeType = msg.data.split("||")[1];
    await bot.deleteMessage(msg.message.chat.id, msg.message.message_id);
    const newDataValue = await DataValue({
      tgId: msg.message.chat.id,
      value: `addCodes||${codeType}`
    });
    await newDataValue.save();
    bot.sendMessage(msg.message.chat.id, "Qo'shoqmchi bo'lgan kodlaringizni yuboring");
  }
  if(msg.data == "add_user") {
    bot.sendMessage(msg.message.chat.id, "Admin Qilmoqchi Bo'lgan Odamni ID sini yuboring");
    const newDataValue = await DataValue({
      tgId: msg.message.chat.id,
      value: "add_user"
    });
    await newDataValue.save();
  }
  if(msg.data == "delete_user") {
    bot.sendMessage(msg.message.chat.id, "Admindan Olmoqchi Bo'lgan Odamni ID sini yuboring");
    const newDataValue = await DataValue({
      tgId: msg.message.chat.id,
      value: "delete_user"
    });
    await newDataValue.save();
  }
  if (msg.data == "admins") {
    const debts = await Debts.find().populate("userId");
    console.log(debts);
    const keyboardButtons = debts.map((debt) => ({
      text: `${debt.userId.name}`,
      callback_data: `admin||${debt.userId._id}`,
    }));
  
    const reply_markup = {
      inline_keyboard: keyboardButtons.map((button) => [button]),
    };
  
    bot.editMessageText("<b>Adminlar</b>", {
      chat_id: msg.message.chat.id,
      message_id: msg.message.message_id,
      parse_mode: "HTML",
      reply_markup,
    });
  }
  if (stripos(msg.data, "admin||") !== -1) {
    const userId = msg.data.split("||")[1];
    const debt = await Debts.findOne({ userId }).populate("userId");
    const user = await Users.findOne({ _id: userId });
  
    let message = `${debt.userId.name}\n`;
  
    for (const key in debt.codes) {
      if (Object.prototype.hasOwnProperty.call(debt.codes, key)) {
        message += `${key}: ${debt.codes[key]}\n`;
      }
    }
    message += `---------\n${user.balance} USDT`;
    bot.sendMessage(msg.message.chat.id, message, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "⚠️ Restart", callback_data: `restartAd||${userId}` }],
        ],
      },
    });
  }
  
  if (stripos(msg.data, "restartAd||") !== -1) {
    const userId = msg.data.split("||")[1];
    const debt = await Debts.findOne({ userId }).populate("userId");
    const user = await Users.findOne({ _id: userId });

    if (debt) {
      debt.codes = {
        60: 0,
        325: 0,
        660: 0,
        1800: 0,
        3850: 0,
        8100: 0,
      };
      await debt.save();
      user.balance = 0;
      await user.save();
      bot.sendMessage(debt.tgId, "Bot restarted successfully for your account");
      bot.sendMessage(msg.message.chat.id, `Codes reset to 0 for ${debt.userId.name}`);
    }
  }
  if(msg.data == "admin_page") {
    bot.sendMessage(msg.message.chat.id, "Admin Page",{
      reply_markup: {
        inline_keyboard: [
          [{ text: "🔆 INFO ADMIN", callback_data: "admins" }],
          [{ text: "⏬ DELETE ADMIN", callback_data: "delete_user" }, { text: "⏫ ADD ADMIN", callback_data: "add_user" }],
        ],
      }
    });
  }
  if(msg.data == "get_price"){
    const price = readJsonFile("./price.json");
    const priceId = readJsonFile("./priceId.json");
    bot.sendMessage(msg.message.chat.id, `<b>Price Codes</b>
<b>Code</b>
60UC = ${price[60]} USDT
325UC = ${price[325]} USDT
660UC = ${price[660]} USDT
1800UC = ${price[1800]} USDT
3850UC = ${price[3850]} USDT
8100UC = ${price[8100]} USDT
------------------
<b>By ID</b>
63UC = ${priceId[63]} USDT
355UC = ${priceId[355]} USDT
720UC = ${priceId[720]} USDT
1950UC = ${priceId[1950]} USDT
4000UC = ${priceId[4000]} USDT
8400UC = ${priceId[8400]} USDT`, {
      parse_mode: "HTML"
    });
  }
  if(msg.data == "by_id_code"){
    bot.editMessageText("<b>Tushurmoqchi bo'lgan UC miqdorini tanlang</b>", {
      chat_id: msg.message.chat.id,
      message_id: msg.message.message_id,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "63UC", callback_data: "byid||63" },{ text: "355UC", callback_data: "byid||355" }],
          [{ text: "720UC", callback_data: "byid||720" },{ text: "1950UC", callback_data: "byid||1950" }],
          [{ text: "4000UC", callback_data: "byid||4000" },{ text: "8400UC", callback_data: "byid||8400" }],
        ],
      }
    });
  }
  if(stripos(msg.data, "byid||")!= -1) {
    const codeType = msg.data.split("||")[1];
    await bot.deleteMessage(msg.message.chat.id, msg.message.message_id);
    const newDataValue = await DataValue({
      tgId: msg.message.chat.id,
      value: `byid||${codeType}`
    });
    await newDataValue.save();
    bot.sendMessage(msg.message.chat.id, "IDni yuboring\nExample: <code>524534535</code>", {
      parse_mode: "HTML"
    });
  }
  if(stripos(msg.data, "tasdiqlash||")!= -1) {
    const priceId = readJsonFile("./priceId.json");
    let types = msg.data.split("||");
    await bot.deleteMessage(msg.message.chat.id, msg.message.message_id);
    const newByIds = new ByIds({
      codeType:types[3],
      usedId: types[2],
      price: priceId[types[3]],
      user: types[1]
    });
    await newByIds.save();
    bot.sendMessage(types[1], `✅ UC TUSHDI\nID: <b>${types[2]}</b>\nUC: <b>${types[3]}</b>`, {
      parse_mode: "HTML"
    });
  }
  if(stripos(msg.data, "bekorqilish||")!= -1) {
    const priceId = readJsonFile("./priceId.json");
    let types = msg.data.split("||");
    const user = await Users.findOne({ tgId: types[1] });
    user.balance -= Number(priceId[types[3]]); 
    await user.save();
    await bot.deleteMessage(msg.message.chat.id, msg.message.message_id);
    bot.sendMessage(types[1], `❌ UC TUSHMADI\nID: <b>${types[2]}</b>\nUC: <b>${types[3]}</b>\nPUL QAYTARILDI`, {
      parse_mode: "HTML"
    });
  }
});

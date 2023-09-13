const TelegramBot = require("node-telegram-bot-api");
const Codes = require("./models/Codes");
const DataValue = require("./models/DataValue");
const Users = require("./models/Users");
const Debts = require("./models/Debts");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const stripos = (haystack, needle) => {
  const haystackLower = haystack.toLowerCase();
  const needleLower = needle.toLowerCase();
  return haystackLower.indexOf(needleLower);
}

bot.onText(/\/start/, async (msg) => {
  const user = await Users.findOne({ tgId: msg.chat.id });
  if(!user){
    const newUser = new Users({ tgId: msg.chat.id, name: msg.chat.first_name });
    await newUser.save();
  }
  bot.sendMessage(msg.chat.id, "Hi! I'm a bot that helps you to add codes to the database.");
})

bot.on("message", async (msg) => {

  const userData = await DataValue.findOne({ tgId: msg.chat.id });
  if (userData && userData.value){
    if(stripos(userData.value, "addCodes||") !== -1){
      const codeType = userData.value.split("||")[1];
      const lines = msg.text.split("\n");
      for (const line of lines) {
        const code = new Codes({ codeType, code: line });
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
    
  }
  const user = await Users.findOne({ tgId: msg.chat.id });
  if (msg.text == "/admin" && (msg.chat.id == process.env.ADMIN_ID || user.isAdmin)) {
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
      ],
    };
  
    if (msg.chat.id == process.env.ADMIN_ID) {
      reply_markup = {
        inline_keyboard: [
          [{ text: "🔰 GET CODE", callback_data: "get_codes" }],
          [{ text: "✳️ ADD CODE", callback_data: "add_codes" }],
          [{ text: "⏫ ADD ADMIN", callback_data: "add_user" }],
          [{ text: "🧑‍✈️ ADMINS", callback_data: "admins" }],
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
💣 8100UC - ${debt.codes[8100]} 💣`, {
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
    bot.editMessageText(`<b>Redeemni tanglang</b>`, {
      chat_id: msg.message.chat.id,
      message_id: msg.message.message_id,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "60UC", callback_data: `promo||60||${quantity}` }],
          [{ text: "325UC", callback_data: `promo||325||${quantity}` }],
          [{ text: "660UC", callback_data: `promo||660||${quantity}` }],
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
    const checker = await Codes.find({ codeType, status: 0 });
    if(checker.length < parseInt(quantity, 10)) {
      bot.sendMessage(msg.message.chat.id, "Yetarlicha Mavjud emas");
    }else{
      const debt = await Debts.findOne({ tgId: msg.message.chat.id });

    if (debt) {
      if (!debt.codes) {
        debt.codes = {};
      }

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

  if(msg.data == "add_codes") {
    bot.editMessageText(`<b>Qo'shmoqchi bo'gan Redeem Turini Tanglang</b>`, {
      chat_id: msg.message.chat.id,
      message_id: msg.message.message_id,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "60UC", callback_data: `addCodes||60` }],
          [{ text: "325UC", callback_data: `addCodes||325` }],
          [{ text: "660UC", callback_data: `addCodes||660` }],
          [{ text: "1800UC", callback_data: `addCodes||1800` }],
          [{ text: "3850UC", callback_data: `addCodes||3850` }],
          [{ text: "8100UC", callback_data: `addCodes||8100` }],
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
  if (msg.data == "admins") {
    const debts = await Debts.find().populate("userId");
  
    const keyboardButtons = debts.map((debt) => ({
      text: `${debt.userId.name}`,
      callback_data: `admin||${debt.userId._id}`,
    }));
  
    const reply_markup = {
      inline_keyboard: keyboardButtons.map((button) => [button]),
    };
  
    bot.editMessageText(`<b>Adminlar</b>`, {
      chat_id: msg.message.chat.id,
      message_id: msg.message.message_id,
      parse_mode: "HTML",
      reply_markup,
    });
  }
  if (stripos(msg.data, "admin||") !== -1) {
    const userId = msg.data.split("||")[1];
    const debt = await Debts.findOne({ userId }).populate("userId");
  
    let message = `${debt.userId.name}\n`;
  
    for (const key in debt.codes) {
      if (debt.codes.hasOwnProperty(key)) {
        message += `${key}: ${debt.codes[key]}\n`;
      }
    }
  
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
      bot.sendMessage(debt.tgId, "Bot restarted successfully for your account");
      bot.sendMessage(msg.message.chat.id, `Codes reset to 0 for ${debt.userId.name}`);
    }
  }
});

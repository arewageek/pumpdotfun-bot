import express from "express";
import { BotController, Message } from "../controllers/bot.controllers";
import { Bot, Context, InlineKeyboard } from "grammy";
import { run } from "@grammyjs/runner";
import { BuyCallback, SettingsCallback } from "../controllers/callbackQueries";
import { fetchTokenData } from "../helpers/dexscreener.helper";

const router = express.Router();

// router.post("/", Message);

const botToken = process.env.TG_BOT_API!;

// try {
//   await bot.init();
//   await bot.api.setWebhook(process.env.WEBHOOK_URL!);
// } catch (error) {
//   console.log({ error });
// }

let bot: Bot | null = null;

const getBotInstance = () => {
  try {
    if (!bot) {
      bot = new Bot(botToken);

      bot.command("start", async (ctx) => {
        const sender = ctx.message?.chat.first_name;
        const chatId = ctx.chat.id;
        // const sendMessage = await ctx.replyWithPhoto(
        //   "https://i.pinimg.com/736x/4d/5e/67/4d5e675307eec14412cf819b9b75b7b4.jpg",
        //   {
        //     caption: `Hey, ${sender}! \n\nWelcome to Pawn Finance, an opportunity to max possibilities demo trading memes on solana without losing your real funds`,
        //   }
        // );
        // console.log({ chatId });

        const balance = 400;
        const trades = { count: 0, volume: 0 };
        const welcomMessage = `\*Hey, ${sender}, Welcome to Pawn Finance\* 🤗
        \nWe present you an opportunity to maximize possibilities trading memes on solana using a demo account
        \nThink of this as a learning environment where you can simulate your understanding of memes without real funds
        \nYou will be provided with a demo wallet and can fund it at any time using using the deposit button below
        \n\*How to trade?💡\*\nSimply paste the CA in the chat and we'll take it up from there
        \n\*Wallet Balance: \`$${balance.toLocaleString()}\`\* ┃ \*Total Trades: \`${trades.count.toLocaleString()}\`\* ┃ \*Total Volume: \`$${trades.volume.toLocaleString()}\`\*
        \n⚠️\*Please note:\* This bot is 100% free to use
        `;

        bot?.api.sendMessage(chatId, welcomMessage, {
          parse_mode: "MarkdownV2",
          reply_markup: new InlineKeyboard()
            .text("Buy 🟢", "buy")
            .text("Sell 🔴", "sell")
            .row()
            .text("Account 💰", "account")
            .text("Positions 📈", "positions")
            .text("Settings ⚙️", "settings")
            .row()
            .text("⟲ Refresh", "refresh")
            .row()
            .url("Follow us on X", "https://x.com/pawn_fi")
            .url("Join Our Telegram", "https://x.com/pawn_fi"),
        });
      });

      bot.on("message", async (ctx: Context) => {
        const ca = ctx.message?.text;
        const data = await fetchTokenData(ca!);
        const token = data.data;
        console.log({ token });

        const response = `Token Name: \`${token?.name}\` 🚀🚀\n\`${token?.address}\`
        `;

        token
          ? ctx.reply(response, {
              parse_mode: "Markdown",
              reply_markup: new InlineKeyboard()
                .text("Buy 🟢", "buy")
                .text("Sell 🔴", "sell"),
            })
          : ctx.reply(
              "Oops! 🤭🤭\n\nCould not find the contract address you provided"
            );
      });

      //   bot callbacks
      //   trade callbacks
      bot.callbackQuery("buy", BuyCallback);
      //   config callbacks
      bot.callbackQuery("settings", SettingsCallback);
    }
    run(bot);
    console.log("Bot is now running");
  } catch (error) {
    console.log({ error });
  } finally {
    return bot;
  }
};

getBotInstance();

export default router;

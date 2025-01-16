import express from "express";
import { Bot, Context } from "grammy";
import { run } from "@grammyjs/runner";
import {
  AccountCallback,
  BuyCallback,
  FundCallback,
  PositionsCallback,
  RequestCACallback,
  SettingsCallback,
  StartContext,
  WithdrawCallback,
} from "../controllers/callbackQueries";
import {
  handleFundWallet,
  handleFundWithdrawal,
  handleTokenBuy,
  handleTokenCA,
} from "../controllers/messageHandler";

const router = express.Router();

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

      bot.command("start", StartContext);

      bot.on("message", async (ctx: Context) => {
        const replyText: string | undefined =
          ctx.message?.reply_to_message?.text;
        const isReply: boolean = !!replyText;

        if (!isReply) {
          handleTokenCA(ctx);
        } else {
          switch (replyText) {
            case "Please paste the Contract Address of the token you wish to buy in the chat":
              handleTokenCA(ctx);
              break;
            case "How much would you like to credit into your account?":
              handleFundWallet(ctx);
              break;
            case "How much would you like to withdraw?":
              handleFundWithdrawal(ctx);
              break;
            case "Please input the amount you want to buy in USDC":
              handleTokenBuy(ctx);
              break;
            default:
              handleTokenCA(ctx);
          }
        }
      });

      //   bot callbacks
      //   trade callbacks
      bot.callbackQuery("request_ca", RequestCACallback);
      bot.callbackQuery("buy", BuyCallback);
      bot.callbackQuery("positions", PositionsCallback);
      //   config callbacks
      bot.callbackQuery("settings", SettingsCallback);
      bot.callbackQuery("account", AccountCallback);
      bot.callbackQuery("back", StartContext);
      // wallet balance callbacks
      bot.callbackQuery("fund", FundCallback);
      bot.callbackQuery("withdraw", WithdrawCallback);
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

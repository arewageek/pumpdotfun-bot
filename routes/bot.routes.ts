import express from "express";
import { Bot, Context } from "grammy";
import { run } from "@grammyjs/runner";
import {
  handleFundWallet,
  handleFundWithdrawal,
  handleTokenBuy,
  handleTokenCA,
  handleTokenPreview,
} from "../controllers/messageHandler";
import {
  CreateTokenContext,
  StartContext,
  WalletContext,
} from "../controllers/callbackQueries";

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

      //   pumpdotfun callbacks
      bot.callbackQuery("create", CreateTokenContext);

      // wallet callbacks
      bot.callbackQuery("wallet", WalletContext);
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

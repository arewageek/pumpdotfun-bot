import express from "express";
import { Bot } from "grammy";
import { run } from "@grammyjs/runner";
import {
  CreateTokenContext,
  StartContext,
  WalletContext,
} from "../controllers/callbackQueries";

const router = express.Router();

const botToken = process.env.TG_BOT_API!;

let bot: Bot | null = null;

const getBotInstance = () => {
  try {
    if (!bot) {
      bot = new Bot(botToken);

      bot.command("start", StartContext);

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

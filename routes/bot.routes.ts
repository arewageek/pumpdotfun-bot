import express from "express";
import { Bot } from "grammy";
import { run } from "@grammyjs/runner";
import {
  CreateTokenContext,
  StartContext,
  StartTokenCreationContext,
  WalletContext,
} from "../controllers/callbackQueries";
import {
  handleTokenDescription,
  handleTokenMint,
  handleTokenName,
  handleTokenSymbol,
} from "../controllers/messageHandler";

const router = express.Router();

const botToken = process.env.TG_BOT_API!;

let bot: Bot | null = null;

const getBotInstance = () => {
  try {
    if (!bot) {
      bot = new Bot(botToken);

      bot.command("start", StartContext);

      // custom commands sent to the bot
      bot.on("message", async (ctx) => {
        let isReply: boolean, repliedTo: string | undefined;
        repliedTo = ctx.message.reply_to_message?.text;
        isReply = !!repliedTo;

        switch (repliedTo) {
          case "What is the name of this token you want to create?":
            await handleTokenName(ctx);
            break;

          case "Sorry i didn' catch that. Let's start all over ─── What's the name of the token?":
            await handleTokenName(ctx);
            break;

          case "What is the symbol of your token?":
            await handleTokenSymbol(ctx);
            break;

          case "Cool, now I'd like you to share a little story about your project":
            await handleTokenDescription(ctx);
            break;

          case "Perfect, now I'd like you to share a link to the token's logo":
            await handleTokenMint(ctx);
            break;

          default:
            ctx.reply(
              "Seems like you missed it. Please select a button on the /start message to begin"
            );
            break;
        }
      });

      //   pumpdotfun callbacks
      bot.callbackQuery("create", CreateTokenContext);
      bot.callbackQuery("start-create", StartTokenCreationContext);

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

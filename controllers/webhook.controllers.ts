import type { Request, Response } from "express";
import { Bot } from "grammy";

const webhookUrl = process.env.WEBHOOK_URL!;
const botToken = process.env.TG_BOT_API!;

export const SetWebhook = async (req: Request, res: Response) => {
  // try {
  //   const bot = new Bot(botToken);
  //   await bot.api.setWebhook(webhookUrl);
  //   res.status(200).json({ message: "Successfully updated the webhook" });
  // } catch (error: any) {
  //   console.log({ error });
  //   res.status(400).json({ message: error.message });
  // }
};

export const removeWebhook = async (req: Request, res: Response) => {
  // try {
  //   const bot = new Bot(botToken);
  //   await bot.api.deleteWebhook();
  //   res.status(200).json({ message: "Webhook has been deactivated" });
  // } catch (error: any) {
  //   console.log({ error });
  //   res.status(400).json({ message: error.message });
  // }
};

export const readWebhook = async (req: Request, res: Response) => {
  // try {
  //   const bot = new Bot(botToken);
  //   const webhook = await bot.api.getWebhookInfo();
  //   res.status(200).json({ webhook });
  // } catch (error: any) {
  //   console.log({ error });
  //   res.status(400).json({ message: error.message });
  // }
};

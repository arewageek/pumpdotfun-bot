import express from "express";
import webhook from "./routes/webhook.routes";
import bot from "./routes/bot.routes";
import { Bot, webhookCallback } from "grammy";

const app = express();

app.use(express.json());

app.use("/webhook", webhook);

app.use("/bot", bot);

const port = process.env.PORT || 4001;

app.listen(port, () => console.log(`App listening on port ${port}`));

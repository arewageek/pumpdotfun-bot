import express from "express";
import bot from "./routes/bot.routes";

const app = express();

app.use(express.json());

app.use("/bot", bot);

const port = process.env.PORT || 8080;

app.listen(port, () => console.log(`App listening on port ${port}`));

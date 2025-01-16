import mongoose, { Schema } from "mongoose";

interface ITransaction {
  trader: string;
  marketCap: {
    buy: number;
    sell?: number;
  };
  tokenQtty: number;
  usdValue: {
    buy: number;
    sell?: number;
  };
  token: {
    name: string;
    symbol: string;
  };
  isOpen: boolean;
}

const TransactionSchema = new Schema(
  {
    trader: { type: String, required: true },
    marketCap: {
      buy: { type: Number, required: true },
      sell: { type: String, required: false },
    },
    tokenQtty: { type: Number, required: true },
    usdValue: {
      buy: { type: String, required: true },
      sell: { type: String, required: false },
    },

    isOpen: Boolean,
    token: {
      name: String,
      symbol: String,
    },
  },
  { timestamps: true }
);

const Transaction =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;

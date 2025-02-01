// store data types
export interface ITokenBuyStore {
  ca?: string;
  amount?: string;
}
export interface ITokenCreateStore {
  name: string;
  symbol: string;
  description: string;
  initialBuy: number;
  image: string;
  twitter: string;
  telegram: string;
  website?: string;
}

// account data types
export interface IWallet {
  token: string;
  public: PublicKey;
}

// token metadata
export interface IMetadata {
  name: string;
  symbol: string;
  supply: number;
}

// server response
export interface IResponse {
  success: boolean;
  message?: string;
}
// extended server response
interface IRes extends IResponse {
  data: any;
}

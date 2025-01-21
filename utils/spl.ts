import {
  createAccount,
  createAssociatedTokenAccount,
  getAccount,
  getAssociatedTokenAddress,
  mintTo,
  transfer,
} from "@solana/spl-token";
import type { Connection, PublicKey } from "@solana/web3.js";

/**
 * Get the balance of an SPL token for a given wallet.
 * @param {Connection} connection The Solana connection object.
 * @param {PublicKey} walletAddress The wallet's public key.
 * @param {PublicKey} tokenMintAddress The token mint address.
 * @returns {Promise<number>} The token balance.
 */
export const getSPLBalance = async (
  connection: Connection,
  walletAddress: PublicKey,
  tokenMintAddress: PublicKey
): Promise<number> => {
  const tokenAccountAddress = await getAssociatedTokenAddress(
    tokenMintAddress,
    walletAddress
  );
  const tokenAccount = await getAccount(connection, tokenAccountAddress);
  return Number(tokenAccount.amount);
};

/**
 * Print the SPL token balance of a given wallet.
 * @param {Connection} connection The Solana connection object.
 * @param {PublicKey} walletAddress The wallet's public key.
 * @param {PublicKey} tokenMintAddress The token mint address.
 */
export const printSPLBalance = async (
  connection: Connection,
  walletAddress: PublicKey,
  tokenMintAddress: PublicKey
) => {
  const balance = await getSPLBalance(
    connection,
    walletAddress,
    tokenMintAddress
  );
  console.log(`Token Balance: ${balance}`);
};

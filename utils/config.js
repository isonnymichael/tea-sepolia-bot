import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

export const RPC_URL = "https://tea-sepolia.g.alchemy.com/public";
export const PRIVATE_KEY = process.env.PRIVATE_KEY;
export const LOG_FILE = "bot.log";

export const getProvider = () => new ethers.JsonRpcProvider(RPC_URL);
export const getWallet = () => new ethers.Wallet(PRIVATE_KEY, getProvider());
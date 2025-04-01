import { ethers } from "ethers";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const RPC_URL = "https://tea-sepolia.g.alchemy.com/public";
const CONTRACT_ADDRESS = "0xcd77Fa493532Af747769A2dc0dd6111a8C3C1E84";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const LOG_FILE = "bot.log";

const ABI = [
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "player", "type": "address"},
            {"indexed": false, "internalType": "string", "name": "action", "type": "string"},
            {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}
        ],
        "name": "Action",
        "type": "event"
    },
    {
        "inputs": [
            {"internalType": "string", "name": "action", "type": "string"},
            {"internalType": "uint256", "name": "value", "type": "uint256"}
        ],
        "name": "interact",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "player", "type": "address"}],
        "name": "getScore",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "", "type": "address"}],
        "name": "scores",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
];

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

const actions = [
    "brew_tea", "drink_tea", "gift_tea", "share_tea", "trade_tea",
    "collect_tea", "sell_tea", "steep_tea", "blend_tea", "taste_tea",
    "store_tea", "offer_tea", "heat_water", "pour_tea", "sip_tea"
];
const loop = 500;

async function interactWithContract() {
    const action = actions[Math.floor(Math.random() * actions.length)];
    const value = Math.floor(Math.random() * 10) + 1;

    try {
        const tx = await contract.interact(action, value);
        console.log(`Sent tx: ${tx.hash} | Action: ${action} | Value: ${value}`);
        await tx.wait();
        
        const receipt = await provider.getTransactionReceipt(tx.hash);
        const gasUsed = parseFloat(ethers.formatUnits(receipt.gasUsed, "gwei")).toFixed(8);
        console.log(`Gas Used: ${gasUsed} TEA`);
    } catch (error) {
        console.error("Transaction failed", error);
    }
}

async function runBot() {
    for (let i = 0; i < loop; i++) {
        await interactWithContract();
        const waitTime = Math.random() * 60000;
        console.log(`Waiting for next interact: ${(waitTime / 1000).toFixed(2)} seconds...`);
        await new Promise(r => setTimeout(r, waitTime));
    }
    
    const logMessage = `[${new Date().toISOString()}] Bot has completed ${loop} transactions today.\n`;
    fs.appendFileSync(LOG_FILE, logMessage);
    console.log(`✅ Bot has completed ${loop} transactions today. Log recorded.`);
}

runBot().catch(console.error);

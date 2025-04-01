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
    "store_tea", "offer_tea", "heat_water", "pour_tea", "sip_tea",
    "stir_tea", "infuse_tea", "pack_tea", "dry_tea", "ferment_tea",
    "grind_tea", "weigh_tea", "filter_tea", "boil_water", "strain_tea",
    "smell_tea", "inspect_leaves", "cup_tea", "sweeten_tea", "cool_tea"
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
        return { success: true };
    } catch (error) {
        console.error("Transaction failed", error);
        return { success: false, error: error.message };
    }
}

async function runBot() {
    let successCount = 0;
    let failCount = 0;
    while (true) {
        for (let i = 0; i < loop; i++) {
            const result = await interactWithContract();
            if (result.success) {
                successCount++;
            } else {
                failCount++;
                fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] Failed: ${result.error}\n`);
            }
            
            const waitTime = Math.random() * (1200000 - 180000) + 180000;
            const minutes = Math.floor(waitTime / 60000);
            const seconds = ((waitTime % 60000) / 1000).toFixed(2);

            console.log(`Waiting for next interact: ${minutes} minutes and ${seconds} seconds...`);
            await new Promise(r => setTimeout(r, waitTime));
        }
        
        const logMessage = `[${new Date().toISOString()}] Bot completed ${loop} transactions. Success: ${successCount}, Failed: ${failCount}\n`;
        fs.appendFileSync(LOG_FILE, logMessage);
        console.log("🔄 Restarting bot...");
    }
}

runBot().catch(console.error);

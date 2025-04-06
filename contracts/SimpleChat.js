import { loadContract } from "../utils/contractLoader.js";
import { log, logError } from "../utils/logger.js";

const CONTRACT_ADDRESS = "0x24f8D6a25F756c7239F978b30b3EEa4Ac6aa1642";
const contract = loadContract("SimpleChat", CONTRACT_ADDRESS);

// Daftar pesan acak yang akan digunakan oleh bot
const RANDOM_MESSAGES = [
    "Tea is the elixir of life!",
    "Just brewed some fresh oolong",
    "Green tea has many health benefits",
    "Tea time is the best time",
    "Herbal tea for relaxation",
    "The art of tea brewing is ancient",
    "Tea leaves tell stories",
    "A cup of tea solves everything",
    "Tea varieties are endless",
    "Tea culture connects people worldwide"
];

// Template pesan dengan timestamp
const MESSAGE_TEMPLATES = [
    "Brewing tea at {time}",
    "Tea session started {time}",
    "Enjoying tea at {time}",
    "Tea temperature perfect at {time}",
    "Sharing tea thoughts {time}"
];

/**
 * Mengirim pesan ke chat
 * @param {string} message - Pesan yang akan dikirim
 * @returns {Promise<{success: boolean, hash?: string, message?: string, error?: string}>}
 */
export const sendMessage = async (message) => {
    try {
        // Validasi panjang pesan
        if (message.length > 200) {
            message = message.substring(0, 197) + "...";
        }

        const tx = await contract.sendMessage(message);
        log(`Message sent - TX: ${tx.hash}`);
        
        return { 
            success: true,
            hash: tx.hash,
            message: message
        };
    } catch (error) {
        logError(`Failed to send message: ${error.message}`);
        return {
            success: false,
            error: error.message,
            message: message
        };
    }
};

/**
 * Membuat pesan acak untuk bot
 * @returns {string} Pesan acak
 */
export const generateRandomMessage = () => {
    // 50% pesan dari daftar tetap, 50% pesan template dengan timestamp
    if (Math.random() > 0.5) {
        return RANDOM_MESSAGES[Math.floor(Math.random() * RANDOM_MESSAGES.length)];
    } else {
        const template = MESSAGE_TEMPLATES[Math.floor(Math.random() * MESSAGE_TEMPLATES.length)];
        const timeStr = new Date().toLocaleTimeString();
        return template.replace('{time}', timeStr);
    }
};

/**
 * Mendapatkan jumlah pesan dalam chat
 * @returns {Promise<{success: boolean, count?: number, error?: string}>}
 */
export const getMessageCount = async () => {
    try {
        const count = await contract.getMessageCount();
        return {
            success: true,
            count: Number(count)
        };
    } catch (error) {
        logError(`Failed to get message count: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Membaca pesan terakhir dari chat
 * @param {number} [count=1] - Jumlah pesan terakhir yang akan dibaca
 * @returns {Promise<{success: boolean, messages?: Array, error?: string}>}
 */
export const readLastMessages = async (count = 1) => {
    try {
        const total = await contract.getMessageCount();
        const startIdx = Math.max(0, Number(total) - count);
        const messages = [];

        for (let i = startIdx; i < total; i++) {
            const msg = await contract.messages(i);
            messages.push({
                sender: msg.sender,
                content: msg.content,
                timestamp: new Date(Number(msg.timestamp) * 1000)
            });
        }

        return {
            success: true,
            messages: messages.reverse() // Pesan terbaru pertama
        };
    } catch (error) {
        logError(`Failed to read messages: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
};
import fs from 'fs';
import path from 'path';
import { logError } from '../utils/logger.js';
import { ethers } from "ethers";

// Default transfer amount range
const DEFAULT_MIN_AMOUNT = 1;
const DEFAULT_MAX_AMOUNT = 10;

// Load addresses from file
const loadRecipients = () => {
    try {
        const filePath = path.join(process.cwd(), 'kyc_address.txt');
        const data = fs.readFileSync(filePath, 'utf-8');

        return data.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && ethers.isAddress(line))
            .map(address => ({
                address: ethers.getAddress(address)
            }));
    } catch (error) {
        logError(`Failed to load recipients: ${error.message}`);
        return []; // Return empty array if file doesn't exist
    }
};

let RECIPIENTS = loadRecipients();

export const getRandomTransferAmount = () => {
    if (RECIPIENTS.length === 0) {
        throw new Error("No recipients available");
    }
    
    const recipient = RECIPIENTS[Math.floor(Math.random() * RECIPIENTS.length)];
    const amount = (Math.random() * (1 - 0.1) + 0.1).toFixed(4);

    return {
        recipient: recipient.address,
        amount: parseFloat(amount)
    };
};

// Reload recipients from file
export const refreshRecipients = () => {
    RECIPIENTS = loadRecipients();
    return RECIPIENTS.length;
};

// Get current recipient count
export const getRecipientCount = () => RECIPIENTS.length;

// Manual add recipient (optional)
export const addRecipient = (address, minAmount = DEFAULT_MIN_AMOUNT, maxAmount = DEFAULT_MAX_AMOUNT) => {
    if (!ethers.isAddress(address)) {
        throw new Error("Invalid Ethereum address");
    }
    RECIPIENTS.push({
        address: ethers.getAddress(address),
        minAmount,
        maxAmount
    });
};
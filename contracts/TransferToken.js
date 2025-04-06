import { ethers } from "ethers";
import { loadContract } from "../utils/contractLoader.js";
import { log, logError } from "../utils/logger.js";
import { 
    getRandomTransferAmount,
    refreshRecipients,
    getRecipientCount 
} from "./TransferRecipients.js";

// Token contract details
const TOKEN_ADDRESS = "0x89a4C0f4F0E4023ef8B8106DDc9f64681FFd57CD";
const BOT_WALLET = "0x89915FBE9fA1978E0053B5402e42077c7763c8e6";

// Load token contract
const tokenContract = loadContract("Teazard", TOKEN_ADDRESS);

/**
 * Transfer tokens to a random recipient
 * @returns {Promise<{success: boolean, hash?: string, recipient?: string, amount?: number, decimals?: number, error?: string}>}
 */
export const transferToken = async () => {
    try {
        // Refresh and check recipients
        refreshRecipients();
        const recipientCount = getRecipientCount();
        
        if (recipientCount === 0) {
            return {
                success: false,
                error: "No recipients available in kyc_address.txt",
                skipped: true
            };
        }

        // Get sender balance first
        const sender = BOT_WALLET;
        const senderBalance = await getTokenBalance(sender);
        
        if (senderBalance === null) {
            return {
                success: false,
                error: "Failed to check sender balance",
                skipped: true
            };
        }

        // Get random recipient and amount
        const { recipient, amount } = await getRandomTransferAmount();
        
        // Get token decimals
        let decimals = 18;;

        // Convert amount to token units
        const amountInUnits = ethers.parseUnits(amount.toString(), decimals);
        
        // Check if sender has enough balance
        const senderBalanceUnits = ethers.parseUnits(senderBalance.toString(), decimals);
        if (senderBalanceUnits < amountInUnits) {
            return {
                success: false,
                error: `Insufficient balance (has ${senderBalance}, needs ${amount})`,
                skipped: true
            };
        }

        // Execute transfer
        const tx = await tokenContract.transfer(recipient, amountInUnits);
        log(`Transferring ${amount} tokens to ${recipient} - TX: ${tx.hash}`);
        
        // Optional: wait for confirmation
        const receipt = await tx.wait();
        log(`Transfer confirmed in block ${receipt.blockNumber}`);
        
        return { 
            success: true,
            hash: tx.hash,
            recipient,
            amount,
            decimals,
            senderBalance
        };
        
    } catch (error) {
        logError(`Transfer failed: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Get token balance of an address
 * @param {string} address 
 * @returns {Promise<number|null>} Balance in token units
 */
export const getTokenBalance = async (address) => {
    try {
        const balance = await tokenContract.balanceOf(address);
        const decimals = 18;
        return parseFloat(ethers.formatUnits(balance, decimals));
    } catch (error) {
        logError(`Balance check failed for ${address}: ${error.message}`);
        return null;
    }
};

/**
 * Get token metadata
 * @returns {Promise<{symbol: string, decimals: number, totalSupply: string}|null>}
 */
export const getTokenInfo = async () => {
    try {
        const [symbol, decimals, totalSupply] = await Promise.all([
            tokenContract.symbol(),
            tokenContract.decimals(),
            tokenContract.totalSupply?.() || Promise.resolve(0)
        ]);
        
        return {
            symbol,
            decimals,
            totalSupply: ethers.formatUnits(totalSupply, decimals)
        };
    } catch (error) {
        logError(`Failed to get token info: ${error.message}`);
        return null;
    }
};

// Optional: Listen for transfer events
export const setupTransferListener = (callback) => {
    tokenContract.on("Transfer", (from, to, value, event) => {
        const transferData = {
            from,
            to,
            value: ethers.formatUnits(value, 18), // Using 18 as fallback
            txHash: event.transactionHash,
            blockNumber: event.blockNumber
        };
        
        // Try to get actual decimals
        tokenContract.decimals()
            .then(decimals => {
                transferData.value = ethers.formatUnits(value, decimals);
                callback(transferData);
            })
            .catch(() => callback(transferData));
    });
};
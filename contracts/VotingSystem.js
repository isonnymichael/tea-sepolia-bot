import { loadContract } from "../utils/contractLoader.js";
import { log, logError } from "../utils/logger.js";

const CONTRACT_ADDRESS = "0xae5fd1bdc856fB43151D6b9c09A489d6DDcD751d";
const contract = loadContract("VotingSystem", CONTRACT_ADDRESS);

// Opsi voting yang tersedia
const VOTE_OPTIONS = {
    0: "Green Tea",
    1: "Black Tea",
    2: "Herbal Tea",
    3: "Oolong Tea"
};

/**
 * Melakukan voting untuk opsi tertentu
 * @param {number} optionId - ID opsi yang dipilih (0-3)
 * @returns {Promise<{success: boolean, hash?: string, optionId?: number, optionName?: string, error?: string}>}
 */
export const vote = async (optionId) => {
    // Validasi optionId
    if (optionId < 0 || optionId > 3) {
        const errorMsg = `Invalid option ID: ${optionId}. Must be between 0-3`;
        logError(errorMsg);
        return { 
            success: false, 
            error: errorMsg,
            optionId,
            optionName: VOTE_OPTIONS[optionId] || 'Unknown'
        };
    }

    const optionName = VOTE_OPTIONS[optionId];

    try {
        // Cek apakah sudah pernah vote
        const address = await contract.signer.getAddress();
        const hasVoted = await contract.hasVoted(address);
        
        if (hasVoted) {
            log(`Skipping vote for ${optionName} - already voted`);
            return { 
                success: false, 
                error: "Already voted",
                skipped: true,
                optionId,
                optionName
            };
        }

        // Lakukan voting
        const tx = await contract.vote(optionId);
        log(`Voting for ${optionName} - TX: ${tx.hash}`);
        
        // Tidak perlu wait() karena delay ditangani di bot.js
        return { 
            success: true,
            hash: tx.hash,
            optionId,
            optionName
        };
    } catch (error) {
        logError(`Vote failed for ${optionName}: ${error.message}`);
        return { 
            success: false, 
            error: error.message,
            optionId,
            optionName
        };
    }
};

/**
 * Mendapatkan hasil voting semua opsi
 * @returns {Promise<{success: boolean, results?: Object, error?: string}>}
 */
export const getVotingResults = async () => {
    try {
        const results = {};
        
        for (const [optionId, optionName] of Object.entries(VOTE_OPTIONS)) {
            const votes = await contract.getVotes(optionId);
            results[optionId] = {
                name: optionName,
                votes: Number(votes)
            };
        }

        log(`Current voting results: ${JSON.stringify(results)}`);
        return {
            success: true,
            results,
            timestamp: Date.now()
        };
    } catch (error) {
        logError(`Failed to get voting results: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Helper untuk mendapatkan opsi voting acak
 * @returns {number} Option ID antara 0-3
 */
export const getRandomOption = () => {
    return Math.floor(Math.random() * 4); // 0-3
};
import { loadContract } from "../utils/contractLoader.js";
import { log, logError } from "../utils/logger.js";

const CONTRACT_ADDRESS = "0xcd77Fa493532Af747769A2dc0dd6111a8C3C1E84";
const contract = loadContract("TeaGame", CONTRACT_ADDRESS);

// Daftar aksi yang tersedia dengan ID dan nama
const TEA_ACTIONS = [
    { id: "brew_tea", name: "Brew Tea" },
    { id: "drink_tea", name: "Drink Tea" },
    { id: "gift_tea", name: "Gift Tea" },
    { id: "share_tea", name: "Share Tea" },
    { id: "trade_tea", name: "Trade Tea" },
    { id: "collect_tea", name: "Collect Tea" },
    { id: "sell_tea", name: "Sell Tea" },
    { id: "steep_tea", name: "Steep Tea" },
    { id: "blend_tea", name: "Blend Tea" },
    { id: "taste_tea", name: "Taste Tea" },
    { id: "store_tea", name: "Store Tea" },
    { id: "offer_tea", name: "Offer Tea" },
    { id: "heat_water", name: "Heat Water" },
    { id: "pour_tea", name: "Pour Tea" },
    { id: "sip_tea", name: "Sip Tea" },
    { id: "stir_tea", name: "Stir Tea" },
    { id: "infuse_tea", name: "Infuse Tea" },
    { id: "pack_tea", name: "Pack Tea" },
    { id: "dry_tea", name: "Dry Tea" },
    { id: "ferment_tea", name: "Ferment Tea" },
    { id: "grind_tea", name: "Grind Tea" },
    { id: "weigh_tea", name: "Weigh Tea" },
    { id: "filter_tea", name: "Filter Tea" },
    { id: "boil_water", name: "Boil Water" },
    { id: "strain_tea", name: "Strain Tea" },
    { id: "smell_tea", name: "Smell Tea" },
    { id: "inspect_leaves", name: "Inspect Leaves" },
    { id: "cup_tea", name: "Cup Tea" },
    { id: "sweeten_tea", name: "Sweeten Tea" },
    { id: "cool_tea", name: "Cool Tea" }
];

/**
 * Mendapatkan aksi acak untuk digunakan di bot.js
 * @returns {{id: string, name: string}} Objek aksi acak
 */
export const getRandomTeaAction = () => {
    return TEA_ACTIONS[Math.floor(Math.random() * TEA_ACTIONS.length)];
};

/**
 * Berinteraksi dengan TeaGame contract
 * @param {string} action - Aksi yang akan dilakukan (id dari TEA_ACTIONS)
 * @param {number} value - Nilai yang akan dikirim
 * @returns {Promise<{success: boolean, hash?: string, action?: string, actionName?: string, value?: number, error?: string}>}
 */
export const interactWithTeaGame = async (action = null, value = null) => {
    // Jika tidak ada parameter, gunakan aksi acak
    const selectedAction = action ? 
        TEA_ACTIONS.find(a => a.id === action) || getRandomTeaAction() : 
        getRandomTeaAction();
    
    const actionValue = value !== null ? value : Math.floor(Math.random() * 10) + 1;

    try {
        const tx = await contract.interact(selectedAction.id, actionValue);
        log(`Tea action: ${selectedAction.name} - TX: ${tx.hash}`);
        
        return { 
            success: true,
            hash: tx.hash,
            action: selectedAction.id,
            actionName: selectedAction.name,
            value: actionValue
        };
    } catch (error) {
        logError(`Failed to perform ${selectedAction.name}: ${error.message}`);
        return { 
            success: false,
            error: error.message,
            action: selectedAction.id,
            actionName: selectedAction.name,
            value: actionValue
        };
    }
};

/**
 * Mendapatkan skor pemain
 * @param {string} address - Alamat pemain
 * @returns {Promise<{success: boolean, score?: number, address?: string, error?: string}>}
 */
export const getScore = async (address) => {
    try {
        const score = await contract.getScore(address);
        return {
            success: true,
            score: Number(score),
            address: address
        };
    } catch (error) {
        logError(`Failed to get score for ${address}: ${error.message}`);
        return {
            success: false,
            error: error.message,
            address: address
        };
    }
};

/**
 * Mendapatkan daftar aksi teh yang tersedia
 * @returns {Array<{id: string, name: string}>} Daftar aksi
 */
export const getTeaActions = () => {
    return TEA_ACTIONS;
};
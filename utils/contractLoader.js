import { getWallet } from "./config.js";
import { logError } from "./logger.js";
import fs from "fs";

export const loadContract = (contractName, address) => {
    try {
        const abi = JSON.parse(fs.readFileSync(`./abis/${contractName}.json`));
        return new ethers.Contract(address, abi, getWallet());
    } catch (error) {
        logError(`Error loading ${contractName} contract: ${error}`);
        throw error;
    }
};

export const loadABI = (contractName) => {
    try {
        return JSON.parse(fs.readFileSync(`./abis/${contractName}.json`));
    } catch (error) {
        logError(`Error loading ${contractName} ABI: ${error}`);
        throw error;
    }
};
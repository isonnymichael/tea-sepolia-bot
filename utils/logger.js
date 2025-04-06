import fs from "fs";
import { LOG_FILE } from "./config.js";

export const log = (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(logMessage);
    fs.appendFileSync(LOG_FILE, logMessage);
};

export const logError = (error) => {
    const timestamp = new Date().toISOString();
    const errorMessage = `[${timestamp}] ERROR: ${error.message || error}\n`;
    console.error(errorMessage);
    fs.appendFileSync(LOG_FILE, errorMessage);
};
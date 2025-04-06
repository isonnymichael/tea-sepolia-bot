import { log, logError } from "./utils/logger.js";
import { 
    interactWithTeaGame, 
    getRandomTeaAction 
} from "./contracts/TeaGame.js";
import { 
    vote, 
    getRandomOption 
} from "./contracts/VotingSystem.js";
import { 
    sendMessage, 
    generateRandomMessage 
} from "./contracts/SimpleChat.js";
import { 
    transferToken,
    getTokenBalance
} from "./contracts/TransferToken.js";

// Konfigurasi bot
const BOT_WALLET = "0x89915FBE9fA1978E0053B5402e42077c7763c8e6";
const OPERATIONAL_HOURS = 12; // Jam operasional per hari
const MIN_INTERVAL = 15000;  // 15 detik
const MAX_INTERVAL = 60000; // 60 detik
const LOOP_COUNT = 500;

// Fungsi untuk mendapatkan interval acak
const getRandomInterval = () => {
    return Math.floor(Math.random() * (MAX_INTERVAL - MIN_INTERVAL + 1)) + MIN_INTERVAL;
};

// Daftar aksi yang tersedia
const ACTIONS = [
    { 
        name: "TeaGame",
        func: async () => {
            const action = getRandomTeaAction();
            return interactWithTeaGame(action.id);
        },
        weight: 2  // Bobot relatif 2
    },
    { 
        name: "VotingSystem",
        func: async () => vote(getRandomOption()),
        weight: 2  // Bobot relatif 2
    },
    { 
        name: "SimpleChat",
        func: async () => sendMessage(generateRandomMessage()),
        weight: 2  // Bobot relatif 2
    },
    { 
        name: "TransferToken",
        func: async () => {
            // Cek balance token sebelum transfer
            const balance = await getTokenBalance(BOT_WALLET);
            if (balance !== null) {
                log(`Current token balance: ${balance}`);
            }
            return transferToken();
        },
        weight: 5 // Bobot relatif 5
    }
];

// Hitung total weight untuk distribusi probabilitas
const TOTAL_WEIGHT = ACTIONS.reduce((sum, action) => sum + action.weight, 0);

// Fungsi untuk memilih aksi berdasarkan weight
const selectRandomAction = () => {
    let random = Math.random() * TOTAL_WEIGHT;
    for (const action of ACTIONS) {
        if (random < action.weight) {
            return action;
        }
        random -= action.weight;
    }
    return ACTIONS[0]; // Fallback
};

// Fungsi utama untuk menjalankan bot
async function runBot() {
    const startTime = Date.now();
    const endTime = startTime + (OPERATIONAL_HOURS * 3600 * 1000);

    let successCount = 0;
    let failCount = 0;
    let loopIteration = 0;
    
    log(`🤖 Starting automated bot for ${OPERATIONAL_HOURS} hours`);
    
    while (Date.now() < endTime) {
        try {
            loopIteration++;
            log(`\n=== Loop iteration ${loopIteration} ===`);
            
            // Pilih aksi secara random dengan weight
            const action = selectRandomAction();
            log(`Executing ${action.name} action...`);
            
            // Eksekusi aksi
            const result = await action.func();
            
            // Update counters
            if (result.success) {
                successCount++;
                log(`✅ ${action.name} action succeeded`);
                if (result.hash) {
                    log(`   TX Hash: ${result.hash}`);
                }
            } else {
                failCount++;
                logError(`❌ ${action.name} action failed`);
                if (result.error) {
                    logError(`   Reason: ${result.error}`);
                }
                if (result.skipped) {
                    log(`   Action skipped: ${result.reason}`);
                }
            }
            
            // Delay sebelum aksi berikutnya
            const waitTime = getRandomInterval();
            log(`Waiting ${(waitTime/1000).toFixed(1)} seconds for next action...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            
            // Reset counters setiap LOOP_COUNT iterasi
            if (loopIteration % LOOP_COUNT === 0) {
                log(`\n=== Summary after ${LOOP_COUNT} iterations ===`);
                log(`Success: ${successCount} | Failed: ${failCount}`);
                log("Resetting counters...\n");
                successCount = 0;
                failCount = 0;
            }
            
        } catch (error) {
            logError(`Unexpected error in main loop: ${error.message}`);
            logError(error.stack);
            
            // Tunggu lebih lama jika terjadi error
            await new Promise(resolve => setTimeout(resolve, 60000));
        }
    }

    log(`⏳ Bot has completed its ${OPERATIONAL_HOURS}-hour operational period`);
}

// Handle process termination
process.on('SIGINT', async () => {
    log("\nGracefully shutting down bot...");
    process.exit(0);
});

async function startBotWithSchedule() {
    while (true) {
        try {
            await runBot();
            
            // Hitung waktu sampai jam operasional berikutnya
            const now = new Date();
            const nextStart = new Date(now);
            nextStart.setHours(nextStart.getHours() + 12, 0, 0, 0);
            
            const delay = nextStart - now;
            log(`💤 Bot sleeping for ${(delay/3600000).toFixed(2)} hours until ${nextStart.toLocaleString()}`);
            
            await new Promise(resolve => setTimeout(resolve, delay));
            
        } catch (error) {
            logError(`Fatal error: ${error.message}`);
            logError(`Stack trace: ${error.stack}`);
            
            const retryDelay = 60000; // 1 menit jika error
            log(`Waiting ${retryDelay/1000} seconds before retrying...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }
}

// Jalankan bot dengan jadwal 12 jam/hari
startBotWithSchedule();
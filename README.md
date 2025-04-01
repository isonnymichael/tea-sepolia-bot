# Tea Sepolia Bot

## Overview
This is an automated bot that interacts with a deployed smart contract on the Tea Sepolia testnet. The bot performs 200 unique transactions daily to climb the leaderboard.

## Features
- Interacts with the smart contract using randomized actions.
- Waits for a random interval between transactions to simulate real user activity.
- Logs transaction details, including gas used and timestamps.
- Runs daily via a cron job on a Ubuntu server.

## Smart Contract Details
- **Contract Address:** `0xcd77Fa493532Af747769A2dc0dd6111a8C3C1E84`
- **Network:** Tea Sepolia
- **Chain ID:** 10218
- **RPC URL:** `https://tea-sepolia.g.alchemy.com/public`

## Installation
### Prerequisites
- Node.js installed (`node -v`)
- `npm` installed (`npm -v`)
- Ubuntu server (optional for scheduling)

### Setup
1. Clone this repository:
   ```sh
   git clone https://github.com/yourusername/tea-sepolia-bot.git
   cd tea-sepolia-bot
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file with the following content:
   ```env
   PRIVATE_KEY=your_private_key
   ```

## Usage
Run the bot manually:
```sh
node bot.js
```

### Running in Background on Ubuntu
To run in the background:
```sh
nohup node bot.js &
```

### Automating with Cron
Schedule the bot to run daily at midnight:
```sh
crontab -e
```
Add this line:
```
0 0 * * * /usr/bin/node /path/to/bot.js
```

## Logs
The bot writes logs to `bot.log` after completing all transactions:
```
[2024-08-12T00:00:00Z] Bot has completed 200 transactions today.
```

## License
This project is licensed under the MIT License.


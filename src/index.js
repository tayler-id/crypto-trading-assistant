// Crypto Trading Assistant

// Load environment variables
require('dotenv').config({ path: './config/.env' });

// Required modules
const Alpaca = require('@alpacahq/alpaca-trade-api');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cron = require('node-cron');
const winston = require('winston');

// Initialize APIs
const alpaca = new Alpaca({
    keyId: process.env.ALPACA_API_KEY_ID,
    secretKey: process.env.ALPACA_SECRET_KEY,
    paper: process.env.ALPACA_BASE_URL.includes('paper'), // Set to true for paper trading
    url: process.env.ALPACA_BASE_URL,
});
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Use the most powerful model available - check Gemini documentation for the latest
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }); // Using a common powerful model

// Setup logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});

// If we're not in production, log to the console as well
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

// Function to fetch Alpaca account balance
async function fetchAccountBalance() {
    logger.info('Fetching account balance...');
    try {
        // Implement fetching logic using Alpaca API
        const account = await alpaca.getAccount();
        logger.info('Account balance fetched. Equity:', account.equity, 'Buying Power:', account.buying_power);
        return account;
    } catch (error) {
        logger.error('Error fetching account balance:', error);
        throw error;
    }
}

// Function to get market data and technical indicators
async function getMarketData() {
    logger.info('Fetching market data...');
    try {
        // Implement fetching logic using CoinGecko API
        const marketDataApiUrl = process.env.MARKET_DATA_API_URL;
        const response = await axios.get(`${marketDataApiUrl}/simple/price?ids=bitcoin&vs_currencies=usd`);
        const bitcoinData = response.data.bitcoin;
        const price = bitcoinData.usd;

        logger.info('Market data fetched. Bitcoin Price (USD):', price);

        // For now, just return the price. More indicators can be added later.
        return { price: price };
    } catch (error) {
        logger.error('Error fetching market data:', error);
        throw error;
    }
}

// Function to get trading recommendation from AI
async function getTradingRecommendation(portfolioValue, buyingPower, marketIndicators) {
    logger.info('Getting trading recommendation from AI...');
    try {
        // Design a prompt for Gemini
        const prompt = `Analyze the following data and provide a trading decision (BUY, SELL, HOLD) for Bitcoin.
Portfolio Value: ${portfolioValue}
Buying Power: ${buyingPower}
Market Indicators: ${JSON.stringify(marketIndicators)}
Recommendation:`;

        // Get recommendation from Gemini API
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const recommendation = response.text().trim().toUpperCase(); // Convert to uppercase for consistency
        logger.info('AI Recommendation:', recommendation);

        // Basic validation of the recommendation
        const validRecommendations = ['BUY', 'SELL', 'HOLD'];
        if (!validRecommendations.includes(recommendation)) {
            logger.warn(`Received invalid AI recommendation: ${recommendation}. Defaulting to HOLD.`);
            return 'HOLD'; // Default to HOLD for invalid recommendations
        }

        return recommendation;
    } catch (error) {
        logger.error('Error getting AI recommendation:', error);
        // Depending on the error, you might want to implement retry logic here
        throw error;
    }
}

// Function to execute trades via Alpaca API
async function executeTrade(recommendation, buyingPower, marketIndicators) {
    logger.info('Executing trade:', recommendation);
    try {
        // Implement trade execution logic using Alpaca API
        const symbol = 'BTC/USD'; // Trading pair for Bitcoin on Alpaca

        if (recommendation === 'BUY') {
            // Calculate quantity to buy based on buyingPower and current price
            const bitcoinPrice = marketIndicators.price;
            if (!bitcoinPrice) {
                logger.error('Cannot execute BUY order: Bitcoin price not available.');
                return; // Exit if price is not available
            }
            // Buy with a portion of buying power, e.g., 90% to leave some buffer
            const notionalAmount = buyingPower * 0.9;
            if (notionalAmount > 0) {
                 await alpaca.createOrder({
                    symbol: symbol,
                    notional: notionalAmount, // Use notional for fractional shares/easy amount
                    side: 'buy',
                    type: 'market',
                });
                logger.info(`Executed BUY order for ${notionalAmount} USD of ${symbol}.`);
            } else {
                logger.info('Not enough buying power to execute BUY order.');
            }
        } else if (recommendation === 'SELL') {
            // For simplicity, this is a placeholder. A real implementation would check positions.
            logger.info('Placeholder: SELL recommendation received. Implement selling logic.');
            // Example: Sell all of a position
            // await alpaca.closePosition(symbol);
            // logger.info(`Executed SELL order for all of ${symbol} position.`);
        } else if (recommendation === 'HOLD') {
            logger.info('Holding position as recommended.');
        } else {
            logger.warn('Unknown recommendation:', recommendation);
        }
        logger.info('Trade execution logic completed.');
    } catch (error) {
        logger.error('Error executing trade:', error);
        // Simple retry logic
        const maxRetries = 3;
        const retryDelayMs = 5000; // 5 seconds

        for (let i = 0; i < maxRetries; i++) {
            logger.info(`Retrying trade execution (Attempt ${i + 1}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, retryDelayMs)); // Wait before retrying
            try {
                // Re-attempt the trade with the same parameters
                await executeTrade(recommendation, buyingPower, marketIndicators);
                logger.info('Trade retry successful.');
                return; // Exit after successful retry
            } catch (retryError) {
                logger.error(`Retry attempt ${i + 1} failed:`, retryError);
                if (i === maxRetries - 1) {
                    logger.error('Max retries reached. Trade execution failed permanently.');
                    throw retryError; // Re-throw the error after max retries
                }
            }
        }
    }
}

// Main trading process
async function runTradingProcess() {
    logger.info('Starting trading process...');
    try {
        const account = await fetchAccountBalance();
        const marketIndicators = await getMarketData();
        const recommendation = await getTradingRecommendation(account.equity, account.buying_power, marketIndicators);
        // Pass marketIndicators to executeTrade
        await executeTrade(recommendation, account.buying_power, marketIndicators);
        logger.info('Trading process completed.');
    } catch (error) {
        logger.error('Trading process failed:', error);
    }
}

// Schedule the trading process
cron.schedule('*/5 * * * *', () => { // Run every 5 minutes
    logger.info('Running scheduled trading process...');
    runTradingProcess();
});

logger.info('Crypto trading assistant started. Scheduling enabled to run every 5 minutes.');

// Example of running the process once for testing
// runTradingProcess(); // Comment out the immediate run once scheduling is enabled

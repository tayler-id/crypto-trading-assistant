// Crypto Trading Assistant

// Crypto Trading Assistant

// Required modules
const Alpaca = require('@alpacahq/alpaca-trade-api');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cron = require('node-cron');
const winston = require('winston');

// Setup logging first so it's available for dotenv loading messages
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

// Load environment variables
const dotenvResult = require('dotenv').config({ path: './config/.env' });

if (dotenvResult.error) {
    console.error("Error loading .env file:", dotenvResult.error);
    logger.error("Error loading .env file:", dotenvResult.error);
} else {
    logger.info(".env file loaded successfully.");
    // Optional: Log loaded variables for debugging (mask secrets in production)
    // For security, avoid logging actual secret keys.
    logger.info(`ALPACA_API_KEY_ID: ${process.env.ALPACA_API_KEY_ID ? 'Loaded' : 'Not Loaded'}`);
    logger.info(`GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? 'Loaded' : 'Not Loaded'}`);
    logger.info(`ALPACA_BASE_URL: ${process.env.ALPACA_BASE_URL}`);
}

// Initialize APIs
const alpaca = new Alpaca({
    keyId: process.env.ALPACA_API_KEY_ID,
    secretKey: process.env.ALPACA_SECRET_KEY,
    paper: process.env.ALPACA_BASE_URL ? process.env.ALPACA_BASE_URL.includes('paper') : true, // Set to true for paper trading, handle undefined
    url: process.env.ALPACA_BASE_URL,
});
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Use the most powerful model available - check Gemini documentation for the latest
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }); // Using a common powerful model

// Function to fetch Alpaca account balance
async function fetchAccountBalance() {
    logger.info('Fetching account balance...');
    try {
        // Implement fetching logic using Alpaca API
        const account = await alpaca.getAccount();
        // Ensure buying_power and equity are numbers
        account.equity = parseFloat(account.equity);
        account.buying_power = parseFloat(account.buying_power);
        logger.info(`Account balance fetched. Equity: ${account.equity}, Buying Power: ${account.buying_power}`);
        return account;
    } catch (error) {
        logger.error('Error fetching account balance:', error);
        throw error;
    }
}

// Function to get market data and technical indicators
async function getMarketData(coinId = 'bitcoin', vsCurrency = 'usd', days = '60', interval = 'daily') { // Changed days to 60 for SMA50
    logger.info(`Fetching market data for ${coinId}...`);
    try {
        const marketDataApiUrl = process.env.MARKET_DATA_API_URL;
        // Fetch current price
        const priceResponse = await axios.get(`${marketDataApiUrl}/simple/price?ids=${coinId}&vs_currencies=${vsCurrency}`);
        const currentPrice = priceResponse.data[coinId]?.[vsCurrency];

        // Fetch historical market data for chart (includes prices, market caps, total volumes)
        const chartResponse = await axios.get(`${marketDataApiUrl}/coins/${coinId}/market_chart?vs_currency=${vsCurrency}&days=${days}&interval=${interval}`);
        
        // Fetch OHLC data (Open, High, Low, Close)
        // Note: CoinGecko's OHLC data might have limitations on free tier or specific intervals.
        // Example: Fetch OHLC for the last 1 day (adjust 'days' as needed, e.g., 1, 7, 30)
        const ohlcResponse = await axios.get(`${marketDataApiUrl}/coins/${coinId}/ohlc?vs_currency=${vsCurrency}&days=1`);


        if (!currentPrice) {
            logger.warn(`Current price for ${coinId} not found.`);
        }
        logger.info(`Market data fetched. ${coinId} Price (${vsCurrency.toUpperCase()}): ${currentPrice}`);

        // Construct marketIndicators object
        const marketIndicators = {
            currentPrice: currentPrice,
            historicalPrices: chartResponse.data.prices, // Array of [timestamp, price]
            marketCaps: chartResponse.data.market_caps, // Array of [timestamp, market_cap]
            totalVolumes: chartResponse.data.total_volumes, // Array of [timestamp, total_volume]
            ohlc: ohlcResponse.data // Array of [timestamp, open, high, low, close]
        };
        
        // Add more indicators as needed (e.g., calculating MAs, RSI from historicalPrices)
        // For example, to calculate a simple moving average (SMA):
        if (marketIndicators.historicalPrices && marketIndicators.historicalPrices.length > 0) {
            const closingPrices = marketIndicators.historicalPrices.map(p => p[1]);
            // SMA 7 (example)
            if (closingPrices.length >= 7) {
                const sma7 = closingPrices.slice(-7).reduce((a, b) => a + b, 0) / 7;
                marketIndicators.sma7 = sma7;
                logger.info(`SMA 7 for ${coinId}: ${sma7}`);
            }
             // SMA 50 (example)
             if (closingPrices.length >= 50) {
                const sma50 = closingPrices.slice(-50).reduce((a, b) => a + b, 0) / 50;
                marketIndicators.sma50 = sma50;
                logger.info(`SMA 50 for ${coinId}: ${sma50}`);
            }
        }


        return marketIndicators;
    } catch (error) {
        logger.error('Error fetching market data:', error.message);
        if (error.response) {
            logger.error('Error response data:', error.response.data);
            logger.error('Error response status:', error.response.status);
        }
        throw error;
    }
}

// Function to get trading recommendation from AI
async function getTradingRecommendation(portfolioValue, buyingPower, marketIndicators) {
    logger.info('Getting trading recommendation from AI...');
    try {
        // Design a prompt for Gemini
        // Enhanced prompt to guide the AI better
        const prompt = `
Analyze the provided cryptocurrency market data and portfolio status to generate a trading recommendation for Bitcoin (BTC).
Your recommendation must be one of: BUY, SELL, or HOLD.
Provide a brief justification for your recommendation based on the data.

Portfolio Status:
- Total Portfolio Value (USD): ${portfolioValue}
- Available Buying Power (USD): ${buyingPower}

Market Indicators for Bitcoin (BTC/USD):
- Current Price: ${marketIndicators.currentPrice}
- 7-day Simple Moving Average (SMA7): ${marketIndicators.sma7 || 'N/A'}
- 50-day Simple Moving Average (SMA50): ${marketIndicators.sma50 || 'N/A'}
- Recent OHLC (Open, High, Low, Close) data for the last day: ${JSON.stringify(marketIndicators.ohlc.slice(-5))} (showing last 5 periods)
- Historical Price Points (last 7 days, daily): ${JSON.stringify(marketIndicators.historicalPrices.slice(-7))}

Consider the current price relative to moving averages.
A common strategy is to BUY if current price is above SMA50 and SMA7 is above SMA50 (golden cross).
SELL if current price is below SMA50 and SMA7 is below SMA50 (death cross).
Otherwise, HOLD or consider other factors.

Based on this data, what is your trading recommendation (BUY, SELL, or HOLD) and a brief justification?
Recommendation:`;

        // Get recommendation from Gemini API
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let recommendationText = response.text().trim().toUpperCase();
        logger.info('Raw AI Recommendation Text:', recommendationText);

        // Extract BUY, SELL, or HOLD from the AI's response text
        let finalRecommendation = 'HOLD'; // Default to HOLD
        // Look for BUY, SELL, or HOLD as whole words, case-insensitive, take the first match
        const match = recommendationText.match(/\b(BUY|SELL|HOLD)\b/i); 
        if (match && match[0]) {
            finalRecommendation = match[0].toUpperCase(); // Ensure it's uppercase
        } else {
            logger.warn(`Could not extract a clear BUY/SELL/HOLD from AI response: "${recommendationText}". Defaulting to HOLD.`);
        }
        
        logger.info(`Extracted AI Recommendation: ${finalRecommendation}`);
        return finalRecommendation;
    } catch (error) {
        logger.error('Error getting AI recommendation:', error.message);
        if (error.status === 503) { // Specific handling for 503 Service Unavailable
            logger.warn('Gemini API is temporarily unavailable (503). Attempting retries...');
            const maxRetries = 3;
            const retryDelayMs = 10000; // 10 seconds for API outages

            for (let i = 0; i < maxRetries; i++) {
                logger.info(`Retrying AI recommendation (Attempt ${i + 1}/${maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, retryDelayMs));
                try {
                    const result = await model.generateContent(prompt);
                    const response = await result.response;
                    let recommendationText = response.text().trim().toUpperCase();
                    logger.info('Raw AI Recommendation Text (Retry):', recommendationText);

                    let finalRecommendation = 'HOLD';
                    // Look for BUY, SELL, or HOLD as whole words, case-insensitive, take the first match
                    const match = recommendationText.match(/\b(BUY|SELL|HOLD)\b/i); 
                    if (match && match[0]) {
                        finalRecommendation = match[0].toUpperCase(); // Ensure it's uppercase
                    } else {
                        logger.warn(`Could not extract a clear BUY/SELL/HOLD from AI response (Retry): "${recommendationText}". Defaulting to HOLD.`);
                    }
                    logger.info(`AI Recommendation successful on retry: ${finalRecommendation}`);
                    return finalRecommendation;
                } catch (retryError) {
                    logger.error(`Retry attempt ${i + 1} for AI recommendation failed:`, retryError.message);
                    if (i === maxRetries - 1) {
                        logger.error('Max retries reached for AI recommendation. Defaulting to HOLD for this cycle.');
                        return 'HOLD'; // Default to HOLD after max retries for 503
                    }
                }
            }
        }
        // For other errors, or if retries for 503 also fail and we didn't return HOLD above.
        logger.error('Failed to get AI recommendation after all attempts or due to non-retryable error. Defaulting to HOLD for this cycle.');
        return 'HOLD'; // Default to HOLD if initial call or retries fail for other reasons
    }
}

// Function to execute trades via Alpaca API
async function executeTrade(recommendation, buyingPower, marketIndicators) {
    logger.info(`Executing trade based on recommendation: ${recommendation}`);
    const symbol = 'BTC/USD'; // Trading pair for Bitcoin on Alpaca
    const maxRetries = 3;
    const retryDelayMs = 5000; // 5 seconds

    let attempt = 0;
    while (attempt <= maxRetries) {
        try {
            if (attempt > 0) {
                logger.info(`Retrying trade execution (Attempt ${attempt}/${maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, retryDelayMs)); // Wait before retrying
            }

            if (recommendation === 'BUY') {
                const bitcoinPrice = marketIndicators.currentPrice;
                if (!bitcoinPrice) {
                    logger.error('Cannot execute BUY order: Bitcoin price not available.');
                    return; 
                }
                logger.info(`Attempting BUY order. Buying Power: ${buyingPower}, Bitcoin Price: ${bitcoinPrice}`);
                if (typeof buyingPower !== 'number' || isNaN(buyingPower) || buyingPower <= 0) {
                    logger.error(`Invalid buying power: ${buyingPower}. Cannot execute BUY order.`);
                    return;
                }
                const notionalAmount = buyingPower * 0.9; // Use 90% of buying power
                logger.info(`Calculated Notional Amount for BUY: ${notionalAmount}`);
                if (notionalAmount > 1) { // Alpaca might have minimum notional value (e.g. $1)
                    logger.info(`Attempting to create BUY order with symbol: ${symbol}, notional: ${notionalAmount}`);
                    await alpaca.createOrder({
                        symbol: symbol, 
                        notional: notionalAmount,
                        side: 'buy',
                        type: 'market',
                        time_in_force: 'gtc', // Specify time_in_force for crypto
                    });
                    logger.info(`Executed BUY order for ${notionalAmount} USD of ${symbol}.`);
                    return; // Success
                } else {
                    logger.info('Not enough buying power (or notional < $1) to execute BUY order.');
                    return; // Not an error, but can't trade
                }
            } else if (recommendation === 'SELL') {
                logger.info('SELL recommendation received. Checking for existing position...');
                try {
                    const position = await alpaca.getPosition(symbol);
                    if (position && parseFloat(position.qty) > 0) {
                        logger.info(`Existing position found for ${symbol}: Qty ${position.qty}. Closing position.`);
                        await alpaca.closePosition(symbol);
                        logger.info(`Executed SELL order to close entire ${symbol} position.`);
                    } else {
                        logger.info(`No existing position found for ${symbol} to sell.`);
                    }
                    return; // Success or no action needed
                } catch (error) {
                    if (error.statusCode === 404) {
                        logger.info(`No existing position found for ${symbol} to sell (404).`);
                        return; // No position to sell, not an error for retry
                    }
                    throw error; // Re-throw other errors to be caught by the outer catch for retry
                }
            } else if (recommendation === 'HOLD') {
                logger.info('Holding position as recommended.');
                return; // Success (no action)
            } else {
                logger.warn(`Unknown recommendation: ${recommendation}. No action taken.`);
                return; // Unknown recommendation, not an error for retry
            }
        } catch (error) {
            logger.error(`Error executing trade (Attempt ${attempt}):`, error.message);
            if (attempt === maxRetries) {
                logger.error('Max retries reached. Trade execution failed permanently.');
                // Optionally, re-throw or handle as a persistent failure
                // For now, we'll just log and let the process complete for this cycle
                return; 
            }
            // Log specific Alpaca error details if available
            if (error.response && error.response.data) {
                 logger.error('Alpaca API error details:', error.response.data);
            }
             // Only retry for specific, potentially transient errors (e.g., 5xx, network issues)
             // A 422 error (Unprocessable Entity) usually means the request itself is flawed (e.g. bad symbol, insufficient funds not caught by pre-check)
             // and retrying the same request won't help.
            if (error.statusCode && (error.statusCode === 422 || error.statusCode === 403 || error.statusCode === 401)) {
                logger.error(`Non-retryable Alpaca API error ${error.statusCode}. Aborting retries for this trade.`);
                return;
            }
        }
        attempt++;
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
runTradingProcess(); // Comment out the immediate run once scheduling is enabled

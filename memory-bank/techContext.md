# Technical Context: Crypto Trading Assistant

## 1. Technologies Used

- **Language:** Node.js (JavaScript)
- **Package Manager:** npm
- **Core Libraries:**
    - `@alpacahq/alpaca-trade-api`: For interacting with the Alpaca trading API.
    - `axios`: For making HTTP requests to the CoinGecko market data API.
    - `@google/generative-ai`: For interacting with the Google Gemini API.
    - `node-cron`: For scheduling the trading process.
    - `winston`: For logging application activity and errors.
    - `dotenv`: For loading environment variables from a `.env` file.
- **External APIs:**
    - Alpaca API (Trading & Account Management) - Orders for crypto use `time_in_force: 'gtc'`.
    - CoinGecko API (Market Data - `/simple/price`, `/coins/{id}/market_chart`, `/coins/{id}/ohlc`)
    - Google Gemini API (AI Analysis - `gemini-1.5-flash-latest` model)
- **Version Control:** Git, GitHub
- **Technical Indicators Calculated:**
    - Simple Moving Average (SMA7)
    - Simple Moving Average (SMA50)

## 2. Development Setup

- **Environment:** Node.js environment (v18+ recommended).
- **Installation:** Run `npm install` in the project root (`d:/Dev/crypto-trading-assistant`).
- **Configuration:**
    - Create `config/.env` file.
    - Add necessary API keys and base URLs:
        - `ALPACA_API_KEY_ID`
        - `ALPACA_SECRET_KEY`
        - `ALPACA_BASE_URL` (paper or live)
        - `GEMINI_API_KEY`
        - `MARKET_DATA_API_URL` (CoinGecko base URL)
- **Running:** Execute `node src/index.js` from the project root.

## 3. Technical Constraints & Considerations

- **API Rate Limits:** All external APIs (Alpaca, CoinGecko, Gemini) have rate limits.
- **API Key Security:** API keys in `.env` are gitignored. Use environment variables for production.
- **Market Data Latency & Accuracy:** CoinGecko data may have delays.
- **Indicator Calculation:** SMAs based on daily CoinGecko data.
- **AI Response Variability:** Gemini responses might vary. Current parsing looks for BUY/SELL/HOLD keywords.
- **Trading Risks:** **This script is for educational/demonstration purposes and should not be used for live trading without significant enhancements and thorough testing.** No sophisticated risk management is implemented.
- **Node.js Single-Threaded Nature:** Long-running synchronous tasks could block the event loop.
- **Alpaca Order Parameters:** Crypto orders require specific `time_in_force` values (e.g., 'gtc'). Notional orders have minimums (e.g., $1).

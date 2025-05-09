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
    - Alpaca API (Trading & Account Management)
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

- **API Rate Limits:** All external APIs (Alpaca, CoinGecko, Gemini) have rate limits. The application logic should be mindful of these, especially with the 5-minute execution schedule. More robust error handling might be needed to handle rate limit errors specifically (e.g., backoff strategies).
- **API Key Security:** API keys stored in `.env` are ignored by Git, but care must be taken not to expose this file or commit keys accidentally. Environment variables are recommended for production deployment.
- **Market Data Latency & Accuracy:** Market data from CoinGecko might have some delay. The accuracy and availability of specific data points (like OHLC for certain intervals) can vary. Real-time, high-frequency data might require different APIs or paid plans.
- **Indicator Calculation:** SMAs are calculated based on daily historical closing prices from CoinGecko. The accuracy depends on the quality and granularity of this data.
- **AI Response Variability:** Gemini API responses might vary. The current implementation expects a response starting with 'BUY'/'SELL'/'HOLD'. More robust parsing or prompt engineering might be needed.
- **Trading Risks:** Automated trading involves significant financial risk. The current logic is basic and does not include sophisticated risk management, position sizing, or stop-loss mechanisms. **This script is for educational/demonstration purposes and should not be used for live trading without significant enhancements and thorough testing.**
- **Node.js Single-Threaded Nature:** While async operations handle I/O well, computationally intensive tasks (if added later) could block the event loop.

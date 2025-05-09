# System Patterns: Crypto Trading Assistant

## 1. Architecture

- **Type:** Automated Trading Bot / Script
- **Platform:** Node.js
- **Core Logic:** Single script (`src/index.js`) orchestrating API calls and logic flow.
- **Data Flow:**
    1.  Fetch Account Data (Alpaca: balance, buying power)
    2.  Fetch Market Data (CoinGecko: current price, historical prices, market caps, total volumes, OHLC for Bitcoin)
    3.  Calculate Technical Indicators (SMA7, SMA50 from historical prices)
    4.  Generate AI Prompt (using Account Data, Market Data, and Calculated Indicators)
    5.  Get AI Recommendation (Gemini: BUY, SELL, HOLD)
    6.  Execute Trade (Alpaca: BUY with notional, SELL by closing position)
- **Scheduling:** Uses `node-cron` for periodic execution (every 5 minutes).
- **Configuration:** Environment variables loaded via `dotenv` from `config/.env`.
- **Logging:** Uses `winston` to log to console and files (`logs/`).

## 2. Key Technical Decisions

- **Brokerage API:** Alpaca (`@alpacahq/alpaca-trade-api`) chosen for its API accessibility for stocks and crypto.
- **Market Data API:** CoinGecko (via `axios`) chosen for its free tier and comprehensive data endpoints (`/simple/price`, `/coins/{id}/market_chart`, `/coins/{id}/ohlc`).
- **AI Decision Engine:** Google Gemini (`@google/generative-ai`) chosen for its generative AI capabilities. Using `gemini-1.5-flash-latest` model.
- **Technical Indicators:** Simple Moving Averages (SMA7, SMA50) calculated locally from historical price data.
- **Scheduling:** `node-cron` selected for its simplicity in scheduling tasks within a Node.js application.
- **Logging:** `winston` chosen as a flexible logging library for Node.js.
- **Environment Management:** `dotenv` used for managing API keys and configuration settings securely.

## 3. Component Relationships

```mermaid
graph TD
    A[Scheduler (node-cron)] --> B(runTradingProcess);
    B --> C{Fetch Account Balance (Alpaca)};
    B --> D{Fetch Market Data (CoinGecko)};
    D --> D1{Calculate Indicators (SMA7, SMA50)};
    C --> E{Generate AI Prompt};
    D --> E;
    D1 --> E;
    E --> F{Get AI Recommendation (Gemini)};
    F --> G{Execute Trade (Alpaca)};
    B --> H[Logging (Winston)];
    C --> H;
    D --> H;
    D1 --> H;
    E --> H;
    F --> H;
    G --> H;

    subgraph External APIs
        I(Alpaca API)
        J(CoinGecko API)
        K(Google Gemini API)
    end

    C --> I;
    G --> I;
    D --> J;
    F --> K;
```

## 4. Error Handling Patterns

- **API Calls:** Wrapped in `try...catch` blocks. Errors are logged using Winston, including response data and status for HTTP errors.
- **Trade Execution:** Includes a basic retry mechanism (3 attempts with 5-second delay) upon failure. `getPosition` 404 errors are handled gracefully.
- **AI Recommendation:** Basic validation checks if the response starts with 'BUY', 'SELL', or 'HOLD'. Defaults to 'HOLD' if an exact match is not found at the beginning of the response.

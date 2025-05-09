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
    5.  Get AI Recommendation (Gemini: BUY, SELL, HOLD) - includes retry logic for API errors with consistent parsing.
    6.  Execute Trade (Alpaca: BUY with fixed notional $100 after checking no existing position, SELL by closing position) - includes non-recursive retry logic.
- **Scheduling:** Uses `node-cron` for periodic execution (every 5 minutes).
- **Configuration:** Environment variables loaded via `dotenv` from `config/.env`.
- **Logging:** Uses `winston` to log to console and files (`logs/`).

## 2. Key Technical Decisions

- **Brokerage API:** Alpaca (`@alpacahq/alpaca-trade-api`).
- **Market Data API:** CoinGecko (via `axios`).
- **AI Decision Engine:** Google Gemini (`@google/generative-ai`) using `gemini-1.5-flash-latest` model.
- **Technical Indicators:** Simple Moving Averages (SMA7, SMA50) calculated locally.
- **Scheduling:** `node-cron`.
- **Logging:** `winston`. Corrected logging for numeric values.
- **Environment Management:** `dotenv`.
- **Order Parameters:**
    - Explicitly set `time_in_force: 'gtc'` for crypto orders on Alpaca.
    - BUY orders use a fixed notional amount of $100 for testing.
    - BUY orders check for existing positions before execution.

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

- **API Calls:** Wrapped in `try...catch` blocks. Errors logged, including response data/status for HTTP errors.
- **Trade Execution (`executeTrade`):**
    - Uses a `while` loop for retries (max 3 attempts, 5s delay), not recursive.
    - Checks for valid `buyingPower` before BUY.
    - Checks for existing position before BUY.
    - `getPosition` 404 errors handled gracefully for BUY and SELL.
    - Corrected retry condition to use `error.response.status` for checking non-retryable Alpaca API errors (403, 422, 401).
- **AI Recommendation (`getTradingRecommendation`):**
    - Includes retry logic for Gemini API calls (specifically for 503 errors), with a 10-second delay.
    - Defaults to 'HOLD' and logs if retries fail or other errors occur.
    - Uses `/\b(BUY|SELL|HOLD)\b/i` regex for parsing, consistently in initial and retry attempts.

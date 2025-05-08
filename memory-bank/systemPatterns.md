# System Patterns: Crypto Trading Assistant

## 1. Architecture

- **Type:** Automated Trading Bot / Script
- **Platform:** Node.js
- **Core Logic:** Single script (`src/index.js`) orchestrating API calls and logic flow.
- **Data Flow:**
    1.  Fetch Account Data (Alpaca)
    2.  Fetch Market Data (CoinGecko)
    3.  Generate AI Prompt (using Account + Market Data)
    4.  Get AI Recommendation (Gemini)
    5.  Execute Trade (Alpaca)
- **Scheduling:** Uses `node-cron` for periodic execution (every 5 minutes).
- **Configuration:** Environment variables loaded via `dotenv` from `config/.env`.
- **Logging:** Uses `winston` to log to console and files (`logs/`).

## 2. Key Technical Decisions

- **Brokerage API:** Alpaca (`@alpacahq/alpaca-trade-api`) chosen for its API accessibility for stocks and crypto.
- **Market Data API:** CoinGecko (via `axios`) chosen for its free tier and simple price endpoint. Currently only fetching Bitcoin price.
- **AI Decision Engine:** Google Gemini (`@google/generative-ai`) chosen for its generative AI capabilities. Using `gemini-1.5-flash-latest` model.
- **Scheduling:** `node-cron` selected for its simplicity in scheduling tasks within a Node.js application.
- **Logging:** `winston` chosen as a flexible logging library for Node.js.
- **Environment Management:** `dotenv` used for managing API keys and configuration settings securely.

## 3. Component Relationships

```mermaid
graph TD
    A[Scheduler (node-cron)] --> B(runTradingProcess);
    B --> C{Fetch Account Balance (Alpaca)};
    B --> D{Fetch Market Data (CoinGecko)};
    C --> E{Generate AI Prompt};
    D --> E;
    E --> F{Get AI Recommendation (Gemini)};
    F --> G{Execute Trade (Alpaca)};
    B --> H[Logging (Winston)];
    C --> H;
    D --> H;
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

- **API Calls:** Wrapped in `try...catch` blocks. Errors are logged using Winston.
- **Trade Execution:** Includes a basic retry mechanism (3 attempts with 5-second delay) upon failure.
- **AI Recommendation:** Basic validation checks if the response is one of 'BUY', 'SELL', 'HOLD'. Defaults to 'HOLD' if invalid.

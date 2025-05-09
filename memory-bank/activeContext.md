# Active Context: Crypto Trading Assistant (2025-05-09)

## 1. Current Work Focus

- Updating Memory Bank files to reflect recent logging improvements, notional amount adjustment, and trade retry condition refinement.
- Committing and pushing updated Memory Bank to GitHub.
- Preparing to re-run the bot for testing.

## 2. Recent Changes

- **Core Logic Enhancements & Fixes in `src/index.js`:**
    - `getMarketData` function fetches current Bitcoin price, historical data (60 days), OHLC data (last day), and calculates SMA7 & SMA50. Logging for price corrected.
    - `getTradingRecommendation` uses an enhanced prompt for Gemini.
    - Implemented robust parsing of the AI recommendation using `/\b(BUY|SELL|HOLD)\b/i`.
    - Added retry logic to `getTradingRecommendation` for Gemini API calls (specifically for 503 errors), defaulting to 'HOLD' if retries fail. Corrected regex in retry block and logging for default.
    - `executeTrade` function:
        - Includes logic for BUY orders and SELL orders (closing existing positions).
        - Corrected to use `marketIndicators.currentPrice`.
        - Added `time_in_force: 'gtc'` to `alpaca.createOrder`.
        - Refined retry logic to a `while` loop.
        - **Adjusted notional amount for BUY orders to 45% of buying power for testing.**
        - **Corrected retry condition to use `error.response.status` for checking non-retryable Alpaca API errors (403, 422, 401).**
        - Added checks for valid `buyingPower` and logs `notionalAmount`.
        - Added more detailed logging for trade attempts and Alpaca API error details.
    - **Corrected logging for numeric values (equity, buying power) in `fetchAccountBalance` to use template literals.**
    - Commented out the immediate `runTradingProcess()` call.
- Git repository updated with these enhancements and fixes.
- Memory Bank files previously created and populated.

## 3. Next Steps

- Update remaining relevant Memory Bank files (`progress.md`, `systemPatterns.md`) with details of the latest fixes.
- Commit updated Memory Bank files to the Git repository.
- Push updated Memory Bank to GitHub.
- Request user to stop any currently running instance of the bot.
- Run the bot (`node src/index.js`) for testing and observe logs.

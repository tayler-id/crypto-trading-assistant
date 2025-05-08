# Prompts: Crypto Trading Assistant

This file documents the prompts used in the Crypto Trading Assistant project.

## 1. Google Gemini API - Trading Recommendation Prompt

This prompt is sent to the Google Gemini API (`gemini-1.5-flash-latest` model) to obtain a trading recommendation for Bitcoin.

**Context:** The prompt provides the AI with the current portfolio value, buying power, and basic market indicators (currently just the price).

**Goal:** To get a simple trading decision (BUY, SELL, or HOLD).

**Prompt Template (from `src/index.js`):**

```
Analyze the following data and provide a trading decision (BUY, SELL, HOLD) for Bitcoin.
Portfolio Value: ${portfolioValue}
Buying Power: ${buyingPower}
Market Indicators: ${JSON.stringify(marketIndicators)}
Recommendation:
```

**Variables:**

-   `${portfolioValue}`: The current total equity of the Alpaca account.
-   `${buyingPower}`: The current buying power available in the Alpaca account.
-   `${marketIndicators}`: A JSON string representing the fetched market data (e.g., `{"price": 60000}`).

**Expected Output:** A single word: `BUY`, `SELL`, or `HOLD`.

**Notes:**

-   This is a basic prompt. It could be significantly improved by:
    -   Including more technical indicators (RSI, moving averages, MACD, etc.).
    -   Providing historical price data.
    -   Giving the AI more context about the trading strategy (e.g., risk tolerance, time horizon).
    -   Specifying the desired output format more strictly.
-   The current implementation only uses the Bitcoin price as a market indicator.

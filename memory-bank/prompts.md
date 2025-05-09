# Prompts: Crypto Trading Assistant

This file documents the prompts used in the Crypto Trading Assistant project.

## 1. Google Gemini API - Trading Recommendation Prompt (Enhanced)

This prompt is sent to the Google Gemini API (`gemini-1.5-flash-latest` model) to obtain a trading recommendation for Bitcoin.

**Context:** The prompt provides the AI with the current portfolio value, buying power, and various market indicators including current price, SMA7, SMA50, and recent OHLC data. It also includes a hint about a common SMA crossover strategy.

**Goal:** To get a simple trading decision (BUY, SELL, or HOLD) along with a brief justification.

**Prompt Template (from `src/index.js`):**

```
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
Recommendation:
```

**Variables:**

-   `${portfolioValue}`: The current total equity of the Alpaca account.
-   `${buyingPower}`: The current buying power available in the Alpaca account.
-   `${marketIndicators}`: An object containing:
    -   `currentPrice`: Current price of Bitcoin.
    -   `sma7`: Calculated 7-day Simple Moving Average.
    -   `sma50`: Calculated 50-day Simple Moving Average.
    -   `ohlc`: Array of recent OHLC data.
    -   `historicalPrices`: Array of recent historical price points.

**Expected Output:** A string starting with `BUY`, `SELL`, or `HOLD`, followed by a brief justification. The code extracts the first word (BUY, SELL, or HOLD).

**Notes:**

-   This prompt is more detailed than the initial version.
-   Further improvements could include:
    -   Adding more technical indicators (RSI, MACD, Bollinger Bands).
    -   Providing more extensive historical data or different timeframes.
    -   Allowing the AI to request more information or clarify ambiguity.
    -   More sophisticated parsing of the AI's justification.
    -   Tailoring the strategy hint or removing it to allow for more open-ended AI analysis.

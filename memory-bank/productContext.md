# Product Context: Crypto Trading Assistant

## 1. Problem Solved

Manually monitoring cryptocurrency markets and making timely trading decisions can be time-consuming, complex, and prone to emotional biases. This assistant aims to automate the trading process, allowing for more consistent and potentially data-driven trading without constant manual intervention.

## 2. How It Should Work

- The assistant runs continuously in the background.
- At regular intervals (e.g., every 5 minutes), it performs the following sequence:
    1.  Fetches the current account balance and buying power from Alpaca.
    2.  Fetches relevant market data (e.g., Bitcoin price, technical indicators) from CoinGecko.
    3.  Constructs a prompt containing the account and market data.
    4.  Sends the prompt to the Google Gemini API for analysis and a trading recommendation (BUY, SELL, or HOLD).
    5.  Parses the AI's recommendation.
    6.  If the recommendation is BUY or SELL, it calculates the appropriate trade size (e.g., based on a percentage of buying power or existing position).
    7.  Executes the trade order via the Alpaca API.
    8.  Logs all steps, decisions, and outcomes.
- The system should handle API errors gracefully, potentially retrying failed operations.

## 3. User Experience Goals

- **Automation:** The primary goal is to automate the trading cycle.
- **Transparency:** Clear logging should allow the user to understand the assistant's actions and decisions.
- **Configuration:** API keys and key parameters (like trading frequency, risk parameters - though not yet implemented) should be configurable.
- **Reliability:** The system should run reliably with proper error handling.

# Project Brief: Crypto Trading Assistant

## 1. Overview

This project aims to build an automated cryptocurrency trading assistant using Node.js. The assistant will leverage APIs for market data analysis and trade execution, guided by AI-driven recommendations.

## 2. Goals

- Automate the process of monitoring cryptocurrency markets (initially Bitcoin).
- Fetch and analyze market data and technical indicators.
- Obtain trading recommendations (BUY, SELL, HOLD) from an AI model (Google Gemini).
- Execute trades automatically on a brokerage platform (Alpaca).
- Run the trading logic at regular intervals.
- Provide logging for monitoring and troubleshooting.

## 3. Core Requirements

- Integration with Alpaca API for account management and trade execution.
- Integration with a market data API (e.g., CoinGecko) for fetching price data and indicators.
- Integration with Google Gemini API for AI-based trading decisions.
- Secure handling of API keys and credentials.
- Robust error handling and retry mechanisms for API calls and trades.
- Scheduling mechanism (e.g., cron) to run the trading process periodically.
- Comprehensive logging of actions, decisions, and errors.

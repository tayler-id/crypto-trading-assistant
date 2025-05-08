# Crypto Trading Assistant

This project is a Node.js application designed to automate cryptocurrency trading based on AI analysis. It integrates with the Alpaca API for trading, a market data API for technical indicators, and the Google Gemini API for trading recommendations.

## Features

- Fetch account balance from Alpaca.
- Retrieve market data and technical indicators for Bitcoin.
- Utilize Google Gemini for trading analysis and recommendations.
- Execute trades via the Alpaca API based on AI recommendations.
- Implement error handling and logging.
- Schedule the trading process to run automatically.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm (Node Package Manager)
- Alpaca API keys (Paper or Live trading)
- Market Data API access (e.g., CoinGecko, TradingView)
- Google Gemini API key

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd crypto-trading-assistant
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure API Keys:**
    - Create a `.env` file in the `config` directory if you haven't already.
    - Add your API keys and other configuration settings to this file. Use the example below and replace the placeholder values:
      ```env
      # Alpaca API Keys
      ALPACA_API_KEY_ID=YOUR_ALPACA_API_KEY_ID
      ALPACA_SECRET_KEY=YOUR_ALPACA_SECRET_KEY
      ALPACA_BASE_URL=https://paper-api.alpaca.markets # Use https://api.alpaca.markets for live trading

      # Google Gemini API Key
      GEMINI_API_KEY=YOUR_GEMINI_API_KEY

      # Market Data API (CoinGecko)
      # Use https://api.coingecko.com/api/v3 for the free tier
      # Use https://pro-api.coingecko.com/api/v3 for paid plans
      MARKET_DATA_API_URL=https://api.coingecko.com/api/v3

      # Add any other configuration variables here
      ```
    - **How to get Alpaca API Keys:** Log in to your Alpaca Trading API account. Navigate to the "Home" section of your dashboard to generate your API Key ID and Secret Key. Be sure to note whether they are for paper or live trading.
    - **How to get Google Gemini API Key:** Go to the Google AI Studio or Google Cloud console to generate an API key for the Gemini API.
    - **Market Data API URL:** The `MARKET_DATA_API_URL` should be set to the base URL of the CoinGecko API you are using (free or paid tier). The application will use the `/simple/price` endpoint to get Bitcoin data.
    - **Note:** Ensure you handle sensitive API keys securely. Consider using environment variables or a dedicated secrets management system in a production environment.

## Usage

1.  **Run the assistant:**
    ```bash
    node src/index.js
    ```
    (Currently runs the process once for testing. Scheduling will be enabled later.)

2.  **Scheduling:**
    - The application uses `node-cron` for scheduling.
    - The cron schedule is currently commented out in `src/index.js`.
    - To enable scheduling, uncomment the `cron.schedule` block and configure the desired frequency.

## Project Structure

- `src/`: Contains the main application code.
- `config/`: Contains configuration files (e.g., `.env` for API keys).
- `logs/`: (Will be created by Winston) Contains log files.

## Roadmap

- Implement actual API calls for Alpaca, market data, and Gemini.
- Refine AI prompt for better trading decisions.
- Implement robust error handling and retry logic for API calls and trades.
- Add more technical indicators and market analysis capabilities.
- Implement position management and risk assessment.
- Add more comprehensive logging.
- Develop testing procedures (backtesting, paper trading).
- Containerize the application (e.g., using Docker).

## .clinerules

Refer to the `.clinerules` file in the project root for project-specific development rules and intelligence.

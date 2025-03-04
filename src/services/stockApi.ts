import axios from "axios";
import type { StockData, HistoricalData } from "@/types";

const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
const BASE_URL = "https://www.alphavantage.co/query";

// Simple in-memory cache
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const stockApi = {
  async getStockQuote(symbol: string): Promise<StockData> {
    const cacheKey = `quote-${symbol}`;

    // Return cached data if available and fresh
    if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_DURATION) {
      return cache[cacheKey].data;
    }

    try {
      const response = await axios.get(BASE_URL, {
        params: {
          function: "GLOBAL_QUOTE",
          symbol,
          apikey: API_KEY,
        },
      });

      const data = response.data["Global Quote"];

      if (!data) {
        throw new Error("No data available");
      }

      const result = {
        symbol: data["01. symbol"],
        price: parseFloat(data["05. price"]),
        change: parseFloat(data["09. change"]),
        changePercent: parseFloat(data["10. change percent"].replace("%", "")),
        high: parseFloat(data["03. high"]),
        low: parseFloat(data["04. low"]),
        open: parseFloat(data["02. open"]),
        previousClose: parseFloat(data["08. previous close"]),
        volume: parseInt(data["06. volume"]),
      };

      // Cache the result
      cache[cacheKey] = { data: result, timestamp: Date.now() };
      return result;
    } catch (error) {
      console.error("Error fetching stock quote:", error);
      throw error;
    }
  },

  async getHistoricalData(symbol: string, days = 30): Promise<HistoricalData[]> {
    const cacheKey = `history-${symbol}-${days}`;

    // Return cached data if available and fresh
    if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_DURATION) {
      return cache[cacheKey].data;
    }

    try {
      const response = await axios.get(BASE_URL, {
        params: {
          function: "TIME_SERIES_DAILY",
          symbol,
          outputsize: "compact",
          apikey: API_KEY,
        },
      });

      const timeSeries = response.data["Time Series (Daily)"];

      if (!timeSeries) {
        throw new Error("No historical data available");
      }

      const result = Object.entries(timeSeries)
        .slice(0, days)
        .map(([date, values]: [string, any]) => ({
          date,
          close: parseFloat(values["4. close"]),
        }))
        .reverse();

      // Cache the result
      cache[cacheKey] = { data: result, timestamp: Date.now() };
      return result;
    } catch (error) {
      console.error("Error fetching historical data:", error);
      throw error;
    }
  },

  async searchStocks(query: string): Promise<any[]> {
    const cacheKey = `search-${query}`;

    // Return cached data if available and fresh
    if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_DURATION) {
      return cache[cacheKey].data;
    }

    try {
      const response = await axios.get(BASE_URL, {
        params: {
          function: "SYMBOL_SEARCH",
          keywords: query,
          apikey: API_KEY,
        },
      });

      const result = response.data.bestMatches || [];

      // Cache the result
      cache[cacheKey] = { data: result, timestamp: Date.now() };
      return result;
    } catch (error) {
      console.error("Error searching stocks:", error);
      throw error;
    }
  },
};

<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <h2 class="text-xl font-bold mb-4">Market Overview</h2>

    <div v-if="isLoading" class="flex justify-center py-6">
      <svg
        class="animate-spin h-8 w-8 text-blue-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>

    <div v-else-if="error" class="text-center py-6 text-red-500">
      <p>{{ error }}</p>
      <button @click="fetchMarketData" class="mt-2 text-blue-500 hover:underline">Try again</button>
    </div>

    <div v-else>
      <ul class="divide-y divide-slate-100">
        <li
          v-for="index in marketIndices"
          :key="index.symbol"
          class="py-3 flex justify-between items-center"
        >
          <div>
            <h3 class="font-bold">{{ index.name }}</h3>
            <p class="text-sm text-slate-500">{{ index.symbol }}</p>
          </div>

          <div class="text-right">
            <p class="font-bold">${{ formatNumber(index.price) }}</p>
            <p :class="['text-sm', index.change >= 0 ? 'text-green-500' : 'text-red-500']">
              {{ index.change >= 0 ? "+" : "" }}{{ formatNumber(index.change) }} ({{
                formatNumber(index.changePercent)
              }}%)
            </p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { stockApi } from "@/services/stockApi";
import type { StockData } from "@/types";

interface MarketIndex extends StockData {
  name: string;
}

const isLoading = ref(true);
const error = ref("");
const marketIndices = ref<MarketIndex[]>([]);

// Major market indices to track
const indices = [
  { symbol: "SPY", name: "S&P 500" },
  { symbol: "DIA", name: "Dow Jones" },
  { symbol: "QQQ", name: "NASDAQ" },
  { symbol: "IWM", name: "Russell 2000" },
];

const formatNumber = (num: number): string => {
  return num.toFixed(2);
};

const fetchMarketData = async () => {
  isLoading.value = true;
  error.value = "";

  try {
    const promises = indices.map(async (index) => {
      const data = await stockApi.getStockQuote(index.symbol);
      return {
        ...data,
        name: index.name,
      };
    });

    marketIndices.value = await Promise.all(promises);
  } catch (err) {
    error.value = "Failed to load market data. Please try again later.";
    console.error("Error fetching market data:", err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchMarketData);
</script>

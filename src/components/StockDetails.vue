<template>
  <div v-if="stock" class="bg-white rounded-lg shadow-lg p-6 mb-6">
    <div class="flex justify-between items-start mb-4">
      <div>
        <h2 class="text-2xl font-bold">{{ stock.symbol }}</h2>
        <p class="text-slate-500">Current Price</p>
        <p class="text-3xl font-bold">${{ formatNumber(stock.price) }}</p>
      </div>
      <div class="text-right">
        <span
          :class="[
            'text-lg font-bold px-3 py-1 rounded',
            stock.change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
          ]"
        >
          {{ stock.change >= 0 ? "+" : "" }}{{ formatNumber(stock.change) }} ({{
            formatNumber(stock.changePercent)
          }}%)
        </span>
        <button
          @click="addToWatchlist"
          class="ml-2 p-2 rounded-full hover:bg-slate-100"
          :title="isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            :fill="isInWatchlist ? 'currentColor' : 'none'"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-slate-50 p-4 rounded">
        <p class="text-slate-500 text-sm">Open</p>
        <p class="font-bold">${{ formatNumber(stock.open) }}</p>
      </div>
      <div class="bg-slate-50 p-4 rounded">
        <p class="text-slate-500 text-sm">Previous Close</p>
        <p class="font-bold">${{ formatNumber(stock.previousClose) }}</p>
      </div>
      <div class="bg-slate-50 p-4 rounded">
        <p class="text-slate-500 text-sm">Day High</p>
        <p class="font-bold">${{ formatNumber(stock.high) }}</p>
      </div>
      <div class="bg-slate-50 p-4 rounded">
        <p class="text-slate-500 text-sm">Day Low</p>
        <p class="font-bold">${{ formatNumber(stock.low) }}</p>
      </div>
    </div>

    <div class="h-64">
      <StockChart
        v-if="chartData.labels.length"
        :chartData="chartData"
        :chartOptions="chartOptions"
      />
      <div v-else class="h-full flex items-center justify-center">
        <p class="text-slate-400">Loading chart data...</p>
      </div>
    </div>
  </div>
  <div v-else class="flex justify-center items-center h-64 bg-white rounded-lg shadow p-6">
    <p class="text-slate-400">Search for a stock to see details</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useWatchlistStore } from "@/stores/watchlist";
import StockChart from "@/components/StockChart.vue";
import type { StockData, HistoricalData } from "@/types";
import { stockApi } from "@/services/stockApi";
import type { ChartOptions } from "chart.js";

const props = defineProps<{
  symbol: string | null;
}>();

const stock = ref<StockData | null>(null);
const historicalData = ref<HistoricalData[]>([]);
const isLoading = ref(false);
const watchlistStore = useWatchlistStore();

const isInWatchlist = computed(() => {
  if (!stock.value) return false;
  return watchlistStore.isInWatchlist(stock.value.symbol);
});

const chartData = computed(() => {
  return {
    labels: historicalData.value.map((data) =>
      new Date(data.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    ),
    datasets: [
      {
        label: stock.value?.symbol || "",
        data: historicalData.value.map((data) => data.close),
        borderColor: stock.value && stock.value.change >= 0 ? "#10b981" : "#ef4444",
        borderWidth: 2,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: false,
      },
    ],
  };
});

const chartOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: "index" as const, // Fixes the type error
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      grid: {
        color: "rgba(156, 163, 175, 0.1)",
      },
      ticks: {
        callback: (tickValue) => {
          const num = typeof tickValue === "number" ? tickValue : parseFloat(tickValue);
          return !isNaN(num) ? `$${num.toFixed(2)}` : tickValue;
        },
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context: any) => `$${context.raw.toFixed(2)}`,
      },
    },
  },
};

const formatNumber = (num: number): string => {
  return num.toFixed(2);
};

const addToWatchlist = () => {
  if (!stock.value) return;

  if (isInWatchlist.value) {
    watchlistStore.removeFromWatchlist(stock.value.symbol);
  } else {
    watchlistStore.addToWatchlist({
      symbol: stock.value.symbol,
      name: stock.value.symbol,
      addedAt: new Date(),
    });
  }
};

const fetchStockData = async () => {
  if (!props.symbol) return;

  isLoading.value = true;
  try {
    const [stockData, histData] = await Promise.all([
      stockApi.getStockQuote(props.symbol),
      stockApi.getHistoricalData(props.symbol, 30),
    ]);

    stock.value = stockData;
    historicalData.value = histData;
  } catch (error) {
    console.error("Error fetching stock data:", error);
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => props.symbol,
  () => {
    if (props.symbol) {
      fetchStockData();
    } else {
      stock.value = null;
      historicalData.value = [];
    }
  },
  { immediate: true }
);
</script>

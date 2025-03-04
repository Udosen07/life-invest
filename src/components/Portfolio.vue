<!-- src/components/Portfolio.vue -->
<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold">Your Portfolio</h2>
      <button
        v-if="selectedStock"
        @click="showAddModal = true"
        class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
      >
        + Add Position
      </button>
    </div>

    <div v-if="portfolio.length === 0" class="text-center py-6 text-slate-400">
      <p>Your portfolio is empty</p>
      <p class="text-sm">Add stocks to track your investments</p>
    </div>

    <div v-else>
      <div class="mb-4 p-4 bg-slate-50 rounded">
        <h3 class="text-lg font-bold mb-2">Portfolio Summary</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-slate-500 text-sm">Total Investment</p>
            <p class="font-bold">${{ totalInvestment.toFixed(2) }}</p>
          </div>
          <div>
            <p class="text-slate-500 text-sm">Current Value</p>
            <p class="font-bold">${{ currentValue.toFixed(2) }}</p>
          </div>
          <div>
            <p class="text-slate-500 text-sm">Total Gain/Loss</p>
            <p :class="['font-bold', totalProfit >= 0 ? 'text-green-500' : 'text-red-500']">
              {{ totalProfit >= 0 ? "+" : "" }}${{ totalProfit.toFixed(2) }} ({{
                totalProfitPercentage.toFixed(2)
              }}%)
            </p>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left text-slate-500 border-b border-slate-200 dark:border-slate-700">
              <th class="pb-2">Symbol</th>
              <th class="pb-2">Shares</th>
              <th class="pb-2">Avg Price</th>
              <th class="pb-2">Current</th>
              <th class="pb-2">Gain/Loss</th>
              <th class="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="position in portfolioWithPrices"
              :key="position.symbol"
              class="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
              @click="$emit('select', position.symbol)"
            >
              <td class="py-3 font-bold">{{ position.symbol }}</td>
              <td class="py-3">{{ position.shares }}</td>
              <td class="py-3">${{ position.averagePrice.toFixed(2) }}</td>
              <td class="py-3">${{ position.currentPrice?.toFixed(2) || "-" }}</td>
              <td class="py-3">
                <span
                  v-if="position.currentPrice"
                  :class="position.profit >= 0 ? 'text-green-500' : 'text-red-500'"
                >
                  {{ position.profit >= 0 ? "+" : "" }}${{ position.profit.toFixed(2) }} ({{
                    position.profitPercentage.toFixed(2)
                  }}%)
                </span>
                <span v-else>-</span>
              </td>
              <td class="py-3">
                <button
                  @click.stop="removePosition(position.symbol)"
                  class="p-1 hover:bg-slate-200 rounded-full"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AddToPortfolio v-if="showAddModal" :symbol="selectedStock" @close="showAddModal = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { usePortfolioStore } from "@/stores/portfolio";
import { stockApi } from "@/services/stockApi";
import AddToPortfolio from "@/components/AddToPortfolio.vue";

const props = defineProps<{
  selectedStock: string | null;
}>();

const emit = defineEmits(["select"]);
const portfolioStore = usePortfolioStore();
const showAddModal = ref(false);
const stockPrices = ref<Record<string, number>>({});

const portfolio = computed(() => portfolioStore.portfolio);

const portfolioWithPrices = computed(() => {
  return portfolio.value.map((position) => {
    const currentPrice = stockPrices.value[position.symbol];
    const profit = currentPrice ? (currentPrice - position.averagePrice) * position.shares : 0;
    const profitPercentage = currentPrice
      ? ((currentPrice - position.averagePrice) / position.averagePrice) * 100
      : 0;

    return {
      ...position,
      currentPrice,
      profit,
      profitPercentage,
    };
  });
});

const totalInvestment = computed(() => {
  return portfolio.value.reduce(
    (sum, position) => sum + position.shares * position.averagePrice,
    0
  );
});

const currentValue = computed(() => {
  return portfolioWithPrices.value.reduce((sum, position) => {
    return sum + (position.currentPrice ? position.shares * position.currentPrice : 0);
  }, 0);
});

const totalProfit = computed(() => currentValue.value - totalInvestment.value);

const totalProfitPercentage = computed(() => {
  return totalInvestment.value > 0 ? (totalProfit.value / totalInvestment.value) * 100 : 0;
});

const fetchStockPrices = async () => {
  const symbols = portfolio.value.map((position) => position.symbol);

  if (symbols.length === 0) return;

  try {
    const prices: Record<string, number> = {};

    // Fetch prices in parallel
    const promises = symbols.map(async (symbol) => {
      try {
        const data = await stockApi.getStockQuote(symbol);
        prices[symbol] = data.price;
      } catch (error) {
        console.error(`Error fetching price for ${symbol}:`, error);
      }
    });

    await Promise.all(promises);
    stockPrices.value = prices;
  } catch (error) {
    console.error("Error fetching stock prices:", error);
  }
};

const removePosition = (symbol: string) => {
  if (confirm(`Are you sure you want to remove ${symbol} from your portfolio?`)) {
    portfolioStore.removeFromPortfolio(symbol);
  }
};

// Fetch prices when component mounts
onMounted(fetchStockPrices);

// Refetch when portfolio changes
watch(portfolio, fetchStockPrices);
</script>

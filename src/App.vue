<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
    <header class="bg-white shadow-md">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 text-indigo-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                clip-rule="evenodd"
              />
            </svg>
            <h1
              class="text-2xl font-bold ml-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500"
            >
              LifeInvest
            </h1>
          </div>

          <div class="flex items-center space-x-4">
            <nav class="hidden md:flex space-x-2">
              <button
                @click="activeTab = 'stocks'"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  activeTab === 'stocks'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-indigo-100',
                ]"
              >
                Stocks
              </button>
              <button
                @click="activeTab = 'portfolio'"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  activeTab === 'portfolio'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-indigo-100',
                ]"
              >
                Portfolio
              </button>
            </nav>
          </div>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-8">
      <StockSearch @select="selectStock" class="mb-8 shadow-lg rounded-xl overflow-hidden" />

      <div v-if="activeTab === 'stocks'" class="space-y-6">
        <StockDetails :symbol="selectedStock" class="bg-white p-6 rounded-xl shadow-lg" />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MarketOverview class="bg-white p-6 rounded-xl shadow-lg" />
          <Watchlist @select="selectStock" class="bg-white p-6 rounded-xl shadow-lg" />
        </div>
      </div>

      <div v-else-if="activeTab === 'portfolio'" class="space-y-6">
        <Portfolio
          :selected-stock="selectedStock"
          @select="selectStock"
          class="bg-white p-6 rounded-xl shadow-lg"
        />
        <StockDetails :symbol="selectedStock" class="bg-white p-6 rounded-xl shadow-lg" />
      </div>

      <div
        class="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-10"
      >
        <div class="flex">
          <button
            @click="activeTab = 'stocks'"
            class="flex-1 py-4 text-center"
            :class="activeTab === 'stocks' ? 'text-indigo-600' : 'text-gray-500'"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            <span class="text-xs font-medium">Stocks</span>
          </button>
          <button
            @click="activeTab = 'portfolio'"
            class="flex-1 py-4 text-center"
            :class="activeTab === 'portfolio' ? 'text-indigo-600' : 'text-gray-500'"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
              />
            </svg>
            <span class="text-xs font-medium">Portfolio</span>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import StockSearch from "@/components/StockSearch.vue";
import StockDetails from "@/components/StockDetails.vue";
import MarketOverview from "@/components/MarketOverview.vue";
import Watchlist from "@/components/Watchlist.vue";
import Portfolio from "@/components/Portfolio.vue";

const selectedStock = ref<string | null>(null);
const activeTab = ref("stocks");

const selectStock = (symbol: string) => {
  selectedStock.value = symbol;
  activeTab.value = "stocks"; // Switch to stocks tab when selecting from portfolio
};
</script>

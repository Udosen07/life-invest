<template>
  <div class="w-full max-w-md mx-auto search-container">
    <div class="relative">
      <input
        type="text"
        v-model="searchQuery"
        @input="handleSearch"
        placeholder="Search for a stock symbol..."
        class="w-full p-3 rounded-lg bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div v-if="isLoading" class="absolute right-3 top-3">
        <svg
          class="animate-spin h-5 w-5 text-gray-500"
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
    </div>

    <div
      v-if="searchResults.length && showResults"
      class="absolute mt-1 w-full max-w-md bg-white rounded-lg shadow-lg z-10 max-h-80 overflow-auto"
    >
      <ul class="py-1">
        <li
          v-for="result in searchResults"
          :key="result['1. symbol']"
          @click="selectStock(result['1. symbol'])"
          class="px-4 py-2 hover:bg-slate-100 cursor-pointer"
        >
          <div class="flex justify-between">
            <div>
              <span class="font-bold">{{ result["1. symbol"] }}</span>
              <span class="text-sm text-slate-500 ml-2">{{ result["2. name"] }}</span>
            </div>
            <span class="text-xs text-slate-400">{{ result["4. region"] }}</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { stockApi } from "@/services/stockApi";

const searchQuery = ref("");
const searchResults = ref<any[]>([]);
const isLoading = ref(false);
const showResults = ref(false);
const searchTimeout = ref<number | null>(null);
const abortController = ref<AbortController | null>(null);

const emit = defineEmits(["select"]);

const handleSearch = async () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  if (searchQuery.value.length < 2) {
    searchResults.value = [];
    showResults.value = false;
    return;
  }

  searchTimeout.value = setTimeout(async () => {
    if (abortController.value) {
      abortController.value.abort();
    }

    abortController.value = new AbortController();

    isLoading.value = true;
    try {
      searchResults.value = await stockApi.searchStocks(searchQuery.value);
      showResults.value = true;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
      } else {
        console.error("Search error:", error);
      }
    } finally {
      isLoading.value = false;
      abortController.value = null;
    }
  }, 300) as unknown as number;
};

const selectStock = (symbol: string) => {
  emit("select", symbol);
  searchQuery.value = symbol;
  showResults.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  if (!(event.target as Element).closest(".search-container")) {
    showResults.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  if (abortController.value) {
    abortController.value.abort();
  }
});
</script>

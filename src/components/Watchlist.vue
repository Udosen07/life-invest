<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <h2 class="text-xl font-bold mb-4">Watchlist</h2>

    <div v-if="watchlist.length === 0" class="text-center py-6 text-slate-400">
      <p>Your watchlist is empty</p>
      <p class="text-sm">Search for stocks and add them to your watchlist</p>
    </div>

    <ul v-else class="divide-y divide-slate-100">
      <li
        v-for="item in watchlist"
        :key="item.symbol"
        class="py-3 flex justify-between items-center hover:bg-slate-50 -mx-6 px-6 cursor-pointer"
        @click="$emit('select', item.symbol)"
      >
        <div>
          <h3 class="font-bold">{{ item.symbol }}</h3>
          <p class="text-sm text-slate-500">{{ item.name }}</p>
        </div>

        <div class="flex items-center">
          <button
            @click.stop="removeFromWatchlist(item.symbol)"
            class="p-1 hover:bg-slate-200 rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-slate-400"
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
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useWatchlistStore } from "@/stores/watchlist";

const watchlistStore = useWatchlistStore();
const watchlist = computed(() => watchlistStore.watchlist);

const removeFromWatchlist = (symbol: string) => {
  watchlistStore.removeFromWatchlist(symbol);
};

defineEmits(["select"]);
</script>

<!-- src/components/AddToPortfolio.vue -->
<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
      <h2 class="text-xl font-bold mb-4">Add to Portfolio</h2>

      <form @submit.prevent="addToPortfolio">
        <div class="mb-4">
          <label class="block text-slate-700 mb-2">Symbol</label>
          <input
            type="text"
            :value="symbol"
            disabled
            class="w-full p-2 border border-slate-300 rounded bg-slate-100"
          />
        </div>

        <div class="mb-4">
          <label class="block text-slate-700 mb-2">Shares</label>
          <input
            v-model.number="shares"
            type="number"
            min="0.01"
            step="0.01"
            class="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div class="mb-6">
          <label class="block text-slate-700 mb-2">Price per share ($)</label>
          <input
            v-model.number="price"
            type="number"
            min="0.01"
            step="0.01"
            class="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div class="flex justify-end space-x-2">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 border border-slate-300 rounded hover:bg-slate-100"
          >
            Cancel
          </button>
          <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Add to Portfolio
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { usePortfolioStore } from "@/stores/portfolio";

const props = defineProps<{
  symbol: string | null;
}>();

const emit = defineEmits(["close"]);
const portfolioStore = usePortfolioStore();

const shares = ref(1);
const price = ref(0);

const addToPortfolio = () => {
  if (!props.symbol) return;

  portfolioStore.addToPortfolio({
    symbol: props.symbol,
    shares: shares.value,
    averagePrice: price.value,
    purchaseDate: new Date().toISOString(),
  });

  emit("close");
};
</script>

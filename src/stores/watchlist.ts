import { defineStore } from "pinia";
import type { WatchlistItem } from "@/types";

export const useWatchlistStore = defineStore("watchlist", {
  state: () => ({
    watchlist: JSON.parse(localStorage.getItem("watchlist") || "[]") as WatchlistItem[],
  }),

  actions: {
    addToWatchlist(item: WatchlistItem) {
      if (!this.isInWatchlist(item.symbol)) {
        this.watchlist.push(item);
        this.saveToLocalStorage();
      }
    },

    removeFromWatchlist(symbol: string) {
      this.watchlist = this.watchlist.filter((item) => item.symbol !== symbol);
      this.saveToLocalStorage();
    },

    isInWatchlist(symbol: string): boolean {
      return this.watchlist.some((item) => item.symbol === symbol);
    },

    saveToLocalStorage() {
      localStorage.setItem("watchlist", JSON.stringify(this.watchlist));
    },
  },
});

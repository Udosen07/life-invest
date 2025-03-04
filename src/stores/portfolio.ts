import { defineStore } from "pinia";

interface PortfolioItem {
  symbol: string;
  shares: number;
  averagePrice: number;
  purchaseDate: string;
}

export const usePortfolioStore = defineStore("portfolio", {
  state: () => ({
    portfolio: JSON.parse(localStorage.getItem("portfolio") || "[]") as PortfolioItem[],
  }),

  getters: {
    totalInvestment(): number {
      return this.portfolio.reduce((sum, item) => sum + item.shares * item.averagePrice, 0);
    },
  },

  actions: {
    addToPortfolio(item: PortfolioItem) {
      const existingItem = this.portfolio.find((p) => p.symbol === item.symbol);

      if (existingItem) {
        // Update existing position with average cost
        const totalShares = existingItem.shares + item.shares;
        const totalCost =
          existingItem.shares * existingItem.averagePrice + item.shares * item.averagePrice;
        existingItem.shares = totalShares;
        existingItem.averagePrice = totalCost / totalShares;
      } else {
        // Add new position
        this.portfolio.push(item);
      }

      this.saveToLocalStorage();
    },

    updateShares(symbol: string, shares: number) {
      const item = this.portfolio.find((p) => p.symbol === symbol);
      if (item) {
        item.shares = shares;

        if (shares <= 0) {
          this.removeFromPortfolio(symbol);
        } else {
          this.saveToLocalStorage();
        }
      }
    },

    removeFromPortfolio(symbol: string) {
      this.portfolio = this.portfolio.filter((item) => item.symbol !== symbol);
      this.saveToLocalStorage();
    },

    saveToLocalStorage() {
      localStorage.setItem("portfolio", JSON.stringify(this.portfolio));
    },
  },
});

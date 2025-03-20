const budgetModel = require("../models/budgetModel");

const budgetService = {
  createBudget: async (quotes) => {
    const id = await budgetModel.create(quotes);
    return id;
  },

  listBudgets: async () => {
    const budgets = await budgetModel.findAll();
    if (!budget) {
      throw new Error("Unable to return budget list");
    }
    return budgets;
  },

  getBudgetById: async (id) => {
    const budget = await budgetModel.findById(id);
    if (!budget) {
      throw new Error("Budget not found");
    }
    return budget;
  },

  deleteBudget: async (id) => {
    const deletedRows = await budgetModel.delete(id);
    if (!deletedRows) {
      throw new Error("Budget not found");
    }
    return deletedRows;
  },
};

module.exports = budgetService;

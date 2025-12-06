import { Timestamp } from 'firebase/firestore';
import * as txSvc from '../src/services/transactions';
import * as cardSvc from '../src/services/cards';
import * as userSvc from '../src/services/users';
import * as categorySvc from '../src/services/categories';
import * as bankSvc from '../src/services/banks';
import * as investmentSvc from '../src/services/investments';
import { DataService as LocalDataService } from './api';

// Helper: normalize date to JS Date so Firestore stores a Timestamp
const normalizeDate = (d: any) => {
  if (!d) return new Date();
  if (d instanceof Date) return d;
  try {
    const parsed = new Date(d);
    if (!isNaN(parsed.getTime())) return parsed;
  } catch (e) {}
  return new Date();
};

export const FirestoreDataService = {
  // TRANSACTIONS
  async getTransactions(userId: string) {
    return await txSvc.getTransactionsByUserId(userId);
  },

  async createTransaction(userId: string, transaction: any) {
    const tx = { ...transaction, date: normalizeDate(transaction.date) };
    await txSvc.createTransaction(userId, tx);
    return tx;
  },

  async createTransactionsBatch(userId: string, transactions: any[]) {
    const created: any[] = [];
    for (const t of transactions) {
      const tx = { ...t, date: normalizeDate(t.date) };
      const result = await txSvc.createTransaction(userId, tx);
      created.push(result);
    }
    return created;
  },

  async updateTransaction(userId: string, transaction: any) {
    const tx = { ...transaction, date: normalizeDate(transaction.date) };
    const updated = await txSvc.updateTransaction(userId, tx.id, tx);
    return updated || tx;
  },

  async deleteTransactions(userId: string, ids: string[]) {
    for (const id of ids) {
      await txSvc.deleteTransaction(userId, id);
    }
  },

  // CATEGORIES
  async getCategories(userId: string) {
    return await categorySvc.getCategoriesByUserId(userId);
  },

  async createCategory(userId: string, category: any) {
    return await categorySvc.createCategory(userId, category);
  },

  async updateCategory(userId: string, category: any) {
    return await categorySvc.updateCategory(userId, category.id, category);
  },

  async deleteCategory(userId: string, id: string) {
    return await categorySvc.deleteCategory(userId, id);
  },

  // BANKS
  async getBanks(userId: string) {
    return await bankSvc.getBanksByUserId(userId);
  },

  async saveBank(userId: string, bank: any) {
    if (bank.id) {
      return await bankSvc.updateBank(userId, bank.id, bank);
    } else {
      return await bankSvc.createBank(userId, bank);
    }
  },

  async updateBankBalance(userId: string, bankId: string, newBalance: number) {
    return await bankSvc.updateBank(userId, bankId, { balance: newBalance });
  },

  async updateBankBalances(userId: string, updates: {id:string, balance:number}[]) {
    for (const u of updates) {
      await bankSvc.updateBank(userId, u.id, { balance: u.balance });
    }
  },

  async deleteBank(userId: string, id: string) {
    return await bankSvc.deleteBank(userId, id);
  },

  // INVESTMENTS
  async getInvestments(userId: string) {
    return await investmentSvc.getInvestmentsByUserId(userId);
  },

  async saveInvestment(userId: string, investment: any) {
    if (investment.id) {
      return await investmentSvc.updateInvestment(userId, investment.id, investment);
    } else {
      return await investmentSvc.createInvestment(userId, investment);
    }
  },

  async deleteInvestment(userId: string, id: string) {
    return await investmentSvc.deleteInvestment(userId, id);
  },

  // USER / CLEANUP
  async deleteAllUserData(userId: string) {
    // Delete user document (this does not cascade-delete subcollections automatically).
    try {
      await userSvc.deleteUser(userId);
    } catch (e) {
      console.warn('Failed to delete user doc, falling back to local cleanup', e);
    }
    // Also perform local cleanup for any fallback data stored in LocalDataService
    await LocalDataService.deleteAllUserData(userId);
  }
};

export default FirestoreDataService;

import { Timestamp } from 'firebase/firestore';
import * as txSvc from '../src/services/transactions';
import * as cardSvc from '../src/services/cards';
import * as userSvc from '../src/services/users';
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
      await txSvc.createTransaction(userId, tx);
      created.push(tx);
    }
    return created;
  },

  async updateTransaction(userId: string, transaction: any) {
    const tx = { ...transaction, date: normalizeDate(transaction.date) };
    await txSvc.updateTransaction(userId, tx.id, tx);
    return tx;
  },

  async deleteTransactions(userId: string, ids: string[]) {
    for (const id of ids) {
      await txSvc.deleteTransaction(userId, id);
    }
  },

  // CATEGORIES (fallback to local until Firestore categories implemented)
  async getCategories(userId: string) {
    return await LocalDataService.getCategories(userId);
  },

  async createCategory(userId: string, category: any) {
    return await LocalDataService.createCategory(userId, category);
  },

  async updateCategory(userId: string, category: any) {
    return await LocalDataService.updateCategory(userId, category);
  },

  async deleteCategory(userId: string, id: string) {
    return await LocalDataService.deleteCategory(userId, id);
  },

  // BANKS (fallback to local)
  async getBanks(userId: string) {
    return await LocalDataService.getBanks(userId);
  },

  async saveBank(userId: string, bank: any) {
    return await LocalDataService.saveBank(userId, bank);
  },

  async updateBankBalance(userId: string, bankId: string, newBalance: number) {
    return await LocalDataService.updateBankBalance(userId, bankId, newBalance);
  },

  async updateBankBalances(userId: string, updates: {id:string, balance:number}[]) {
    return await LocalDataService.updateBankBalances(userId, updates);
  },

  async deleteBank(userId: string, id: string) {
    return await LocalDataService.deleteBank(userId, id);
  },

  // INVESTMENTS (fallback to local)
  async getInvestments(userId: string) {
    return await LocalDataService.getInvestments(userId);
  },

  async saveInvestment(userId: string, investment: any) {
    return await LocalDataService.saveInvestment(userId, investment);
  },

  async deleteInvestment(userId: string, id: string) {
    return await LocalDataService.deleteInvestment(userId, id);
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

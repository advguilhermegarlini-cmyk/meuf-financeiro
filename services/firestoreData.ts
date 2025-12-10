import { Timestamp } from 'firebase/firestore';
import * as txSvc from '../src/services/transactions';
import * as cardSvc from '../src/services/cards';
import * as userSvc from '../src/services/users';
import * as categorySvc from '../src/services/categories';
import * as bankSvc from '../src/services/banks';
import * as investmentSvc from '../src/services/investments';
import { DataService as LocalDataService } from './api';

/**
 * Normaliza data para ISO String (formato consistente)
 * Firestore automaticamente converte para Timestamp
 * @param d - Data em qualquer formato
 * @returns ISO string da data
 */
const normalizeDate = (d: any): string => {
  if (!d) return new Date().toISOString();
  
  // Se já é string ISO, retorna como está
  if (typeof d === 'string' && d.includes('T')) {
    return d;
  }
  
  // Se é Date, converte para ISO string
  if (d instanceof Date) {
    return d.toISOString();
  }
  
  // Se é Timestamp do Firebase, converte para Date e depois ISO
  if (d && typeof d.toDate === 'function') {
    return d.toDate().toISOString();
  }
  
  // Tenta fazer parse como string de data
  try {
    const parsed = new Date(d);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  } catch (e) {}
  
  // Fallback: hoje
  return new Date().toISOString();
};

/**
 * Valida dados de transação antes de enviar
 * @param transaction - Dados da transação
 * @throws Error se dados inválidos
 */
const validateTransactionData = (transaction: any): void => {
  // Campos obrigatórios
  if (!transaction.description || typeof transaction.description !== 'string' || transaction.description.trim() === '') {
    throw new Error('Descrição da transação é obrigatória');
  }
  
  if (typeof transaction.amount !== 'number' || transaction.amount <= 0) {
    throw new Error('Valor deve ser um número positivo');
  }
  
  if (!['income', 'expense', 'transfer'].includes(transaction.type)) {
    throw new Error('Tipo de transação inválido (deve ser income, expense ou transfer)');
  }
  
  if (!transaction.date) {
    throw new Error('Data da transação é obrigatória');
  }
  
  // Validar categoria se não é transfer
  if (transaction.type !== 'transfer' && !transaction.categoryId) {
    throw new Error('Categoria é obrigatória para este tipo de transação');
  }
  
  // Validar banco
  if (!transaction.bankId) {
    throw new Error('Banco/conta é obrigatória');
  }
};

export const FirestoreDataService = {
  // TRANSACTIONS
  async getTransactions(userId: string) {
    return await txSvc.getTransactionsByUserId(userId);
  },

  async createTransaction(userId: string, transaction: any) {
    // Validar dados
    validateTransactionData(transaction);
    
    // Normalizar data para string ISO
    const tx = { 
      ...transaction, 
      date: normalizeDate(transaction.date) 
    };
    
    console.log('🔍 [createTransaction] Dados validados e normalizados:', tx);
    const result = await txSvc.createTransaction(userId, tx);
    return result;
  },

  async createTransactionsBatch(userId: string, transactions: any[]) {
    const created: any[] = [];
    
    for (const t of transactions) {
      try {
        // Validar dados
        validateTransactionData(t);
        
        const tx = { 
          ...t, 
          date: normalizeDate(t.date) 
        };
        
        console.log('📝 Criando transação validada:', tx);
        const result = await txSvc.createTransaction(userId, tx);
        console.log('✅ Transação salva com ID:', result.id);
        created.push(result);
      } catch (error) {
        console.error('❌ Erro ao criar transação:', error);
        throw error;
      }
    }
    
    console.log('📦 Total de transações criadas em batch:', created.length);
    return created;
  },

  async updateTransaction(userId: string, transaction: any) {
    // Validar dados
    validateTransactionData(transaction);
    
    const tx = { 
      ...transaction, 
      date: normalizeDate(transaction.date) 
    };
    
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

  // SUBSCRIPTIONS
  async saveSubscription(userId: string, subscription: any) {
    // Validate subscription data
    if (!subscription.cardId || !subscription.name || !subscription.amount || !subscription.categoryId) {
      throw new Error('subscription obrigatória: cardId, name, amount, categoryId são campos obrigatórios');
    }

    if (subscription.id) {
      // Update existing
      return await (investmentSvc as any).updateSubscription?.(userId, subscription) || subscription;
    } else {
      // Create new
      return await (investmentSvc as any).createSubscription?.(userId, subscription) || subscription;
    }
  },

  async getSubscriptions(userId: string) {
    try {
      return await (investmentSvc as any).getSubscriptions?.(userId) || [];
    } catch (e) {
      console.error('Error fetching subscriptions:', e);
      return [];
    }
  },

  async deleteSubscription(userId: string, id: string) {
    return await (investmentSvc as any).deleteSubscription?.(userId, id);
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


import { User, Transaction, Category, Bank, Investment } from '../types';
import { generateId } from '../utils';

// SIMULATED DATABASE DELAY
const DELAY = 400;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to simulate DB tables in LocalStorage
const getTable = <T>(key: string): T[] => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
};

const setTable = <T>(key: string, data: T[]) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// --- AUTH SERVICE ---
export const AuthService = {
    async login(email: string, password?: string): Promise<User> {
        await delay(DELAY);
        const users = getTable<User & {password?: string}>('mc_users_db');
        const found = users.find(u => u.email === email && u.password === password);
        
        if (!found) throw new Error('Email ou senha inválidos.');
        
        // Return user without password
        const { password: _, ...user } = found;
        return user;
    },

    async register(name: string, email: string, password?: string): Promise<User> {
        await delay(DELAY);
        const users = getTable<User & {password?: string}>('mc_users_db');
        
        if (users.find(u => u.email === email)) {
            throw new Error('Email já cadastrado.');
        }

        const newUser = {
            id: generateId(),
            displayName: name,
            email,
            currency: 'BRL',
            theme: 'dark' as 'dark' | 'light', // Default
            password // In a real DB, hash this!
        };

        users.push(newUser);
        setTable('mc_users_db', users);

        const { password: _, ...user } = newUser;
        return user;
    },

    async updateUser(user: User): Promise<User> {
        await delay(DELAY);
        const users = getTable<User>('mc_users_db');
        const index = users.findIndex(u => u.id === user.id);
        
        if (index !== -1) {
            // Merge existing secure data with updates
            users[index] = { ...users[index], ...user };
            setTable('mc_users_db', users);
            return users[index];
        }
        throw new Error("User not found");
    },

    async changePassword(userId: string, oldPass: string, newPass: string): Promise<void> {
        await delay(DELAY);
        const users = getTable<User & {password?: string}>('mc_users_db');
        const index = users.findIndex(u => u.id === userId);

        if (index !== -1) {
            if (users[index].password !== oldPass) throw new Error("Senha atual incorreta.");
            users[index].password = newPass;
            setTable('mc_users_db', users);
        } else {
            throw new Error("Usuário não encontrado.");
        }
    },
    
    async resetPassword(email: string, newPass: string): Promise<void> {
         await delay(DELAY);
         const users = getTable<User & {password?: string}>('mc_users_db');
         const index = users.findIndex(u => u.email === email);
         
         if (index !== -1) {
             users[index].password = newPass;
             setTable('mc_users_db', users);
         } else {
             throw new Error("Email não encontrado.");
         }
    },

    async deleteAccount(userId: string, password: string): Promise<void> {
        await delay(DELAY);
        const users = getTable<User & {password?: string}>('mc_users_db');
        const index = users.findIndex(u => u.id === userId);
        
        if (index === -1) {
            throw new Error("Usuário não encontrado.");
        }
        
        if (users[index].password !== password) {
            throw new Error("Senha incorreta. Conta não foi excluída.");
        }
        
        // Remove user from database
        users.splice(index, 1);
        setTable('mc_users_db', users);
    }
};

// --- DATA REPOSITORY SERVICE ---
// In a real app, 'userId' would be used to filter queries (WHERE user_id = ...)

export const DataService = {
    // TRANSACTIONS
    async getTransactions(userId: string): Promise<Transaction[]> {
        await delay(DELAY);
        return getTable<Transaction>(`mc_transactions_${userId}`);
    },

    async createTransaction(userId: string, transaction: Transaction): Promise<Transaction> {
        await delay(200); // Faster write
        const list = getTable<Transaction>(`mc_transactions_${userId}`);
        list.push(transaction);
        setTable(`mc_transactions_${userId}`, list);
        return transaction;
    },

    async createTransactionsBatch(userId: string, transactions: Transaction[]): Promise<Transaction[]> {
        await delay(DELAY);
        const list = getTable<Transaction>(`mc_transactions_${userId}`);
        const newList = [...list, ...transactions];
        setTable(`mc_transactions_${userId}`, newList);
        return transactions;
    },

    async updateTransaction(userId: string, transaction: Transaction): Promise<Transaction> {
        await delay(200);
        const list = getTable<Transaction>(`mc_transactions_${userId}`);
        const index = list.findIndex(t => t.id === transaction.id);
        if (index !== -1) {
            list[index] = transaction;
            setTable(`mc_transactions_${userId}`, list);
        }
        return transaction;
    },

    async deleteTransactions(userId: string, ids: string[]): Promise<void> {
        await delay(200);
        let list = getTable<Transaction>(`mc_transactions_${userId}`);
        list = list.filter(t => !ids.includes(t.id));
        setTable(`mc_transactions_${userId}`, list);
    },

    // CATEGORIES
    async getCategories(userId: string): Promise<Category[]> {
        await delay(DELAY);
        return getTable<Category>(`mc_categories_${userId}`);
    },

    async createCategory(userId: string, category: Category): Promise<Category> {
        await delay(200);
        const list = getTable<Category>(`mc_categories_${userId}`);
        list.push(category);
        setTable(`mc_categories_${userId}`, list);
        return category;
    },

    async updateCategory(userId: string, category: Category): Promise<Category> {
        await delay(200);
        const list = getTable<Category>(`mc_categories_${userId}`);
        const index = list.findIndex(c => c.id === category.id);
        if (index !== -1) {
            list[index] = category;
            setTable(`mc_categories_${userId}`, list);
        }
        return category;
    },

    async deleteCategory(userId: string, id: string): Promise<void> {
        await delay(200);
        let list = getTable<Category>(`mc_categories_${userId}`);
        list = list.filter(c => c.id !== id);
        setTable(`mc_categories_${userId}`, list);
    },

    // BANKS
    async getBanks(userId: string): Promise<Bank[]> {
        await delay(DELAY);
        return getTable<Bank>(`mc_banks_${userId}`);
    },

    async saveBank(userId: string, bank: Bank): Promise<Bank> {
        await delay(200);
        const list = getTable<Bank>(`mc_banks_${userId}`);
        const index = list.findIndex(b => b.id === bank.id);
        if (index !== -1) {
            list[index] = bank;
        } else {
            list.push(bank);
        }
        setTable(`mc_banks_${userId}`, list);
        return bank;
    },

    async updateBankBalance(userId: string, bankId: string, newBalance: number): Promise<void> {
        // Specialized method often found in DBs to handle concurrency better
        const list = getTable<Bank>(`mc_banks_${userId}`);
        const index = list.findIndex(b => b.id === bankId);
        if (index !== -1) {
            list[index].balance = newBalance;
            setTable(`mc_banks_${userId}`, list);
        }
    },
    
    // Batch update balances (useful for transfers)
    async updateBankBalances(userId: string, updates: {id: string, balance: number}[]): Promise<void> {
        const list = getTable<Bank>(`mc_banks_${userId}`);
        updates.forEach(u => {
             const index = list.findIndex(b => b.id === u.id);
             if (index !== -1) list[index].balance = u.balance;
        });
        setTable(`mc_banks_${userId}`, list);
    },

    async deleteBank(userId: string, id: string): Promise<void> {
        await delay(200);
        let list = getTable<Bank>(`mc_banks_${userId}`);
        list = list.filter(b => b.id !== id);
        setTable(`mc_banks_${userId}`, list);
    },

    // INVESTMENTS
    async getInvestments(userId: string): Promise<Investment[]> {
        await delay(DELAY);
        return getTable<Investment>(`mc_investments_${userId}`);
    },

    async saveInvestment(userId: string, investment: Investment): Promise<Investment> {
        await delay(200);
        const list = getTable<Investment>(`mc_investments_${userId}`);
        const index = list.findIndex(i => i.id === investment.id);
        if (index !== -1) {
            list[index] = investment;
        } else {
            list.push(investment);
        }
        setTable(`mc_investments_${userId}`, list);
        return investment;
    },

    async deleteInvestment(userId: string, id: string): Promise<void> {
        await delay(200);
        let list = getTable<Investment>(`mc_investments_${userId}`);
        list = list.filter(i => i.id !== id);
        setTable(`mc_investments_${userId}`, list);
    },

    // DELETE ALL USER DATA (for account deletion)
    async deleteAllUserData(userId: string): Promise<void> {
        await delay(DELAY);
        // Delete all user-related data tables
        localStorage.removeItem(`mc_transactions_${userId}`);
        localStorage.removeItem(`mc_categories_${userId}`);
        localStorage.removeItem(`mc_banks_${userId}`);
        localStorage.removeItem(`mc_investments_${userId}`);
    }
};

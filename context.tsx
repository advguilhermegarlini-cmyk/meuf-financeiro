
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Transaction, Category, Bank, DashboardStats, Investment, InvoiceStats } from './types';
import { generateId, GITHUB_COLORS } from './utils';
import { AuthService } from './services/auth';
import { FirestoreDataService as DataService } from './services/firestoreData';
import { auth } from './src/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserById } from './src/services/users';

export const SYSTEM_CATEGORY_ID = 'system_internal';

interface AppContextType {
  user: User | null;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isLoading: boolean; // Added loading state for Async ops

  login: (email: string, password?: string) => Promise<void>;
  register: (name: string, email: string, password?: string) => Promise<void>;
  updateUserProfile: (name: string, timezone: string) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  changePassword: (oldPass: string, newPass: string) => Promise<void>;
  resetPassword: (email: string, newPass: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  logout: () => void;
  
  transactions: Transaction[];
  categories: Category[];
  banks: Bank[];
  investments: Investment[];
  
  // Transactions
  addTransaction: (t: Omit<Transaction, 'id'>, recurrence?: { frequency: string, times: number }) => Promise<void>;
  deleteTransaction: (id: string, deleteFutureSeries?: boolean) => Promise<void>;
  updateTransaction: (t: Transaction) => Promise<void>;
  payInvoice: (cardId: string, amount: number, date: Date, sourceBankId: string, isFullPayment: boolean) => Promise<void>;

  // Categories
  addCategory: (name: string, type: 'income' | 'expense') => Promise<void>;
  updateCategory: (c: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Banks/Cards
  addBank: (bank: Omit<Bank, 'id'>) => Promise<void>;
  updateBank: (bank: Bank) => Promise<void>;
  deleteBank: (id: string) => Promise<void>;

  // Investments
  addInvestment: (inv: Omit<Investment, 'id'>) => Promise<void>;
  updateInvestment: (inv: Investment) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
  handleInvestmentTransaction: (investmentId: string, amount: number, type: 'in' | 'out') => Promise<void>;

  // Analysis (Sync getters based on local cache are fine)
  getDashboardStats: (date: Date) => DashboardStats;
  getBankBalanceAtDate: (bankId: string, date: Date) => number;
  getOverallBalanceAtDate: (date: Date) => number;
  getInvoiceStats: (cardId: string, date: Date) => InvoiceStats;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initial Load (Session Check)
  useEffect(() => {
    const init = async () => {
        try {
            const storedTheme = localStorage.getItem('mc_theme') as 'light' | 'dark';
            
            if (storedTheme) setTheme(storedTheme);

            // Usa onAuthStateChanged para sincronizar com Firebase Auth
            const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                if (firebaseUser) {
                    // Usuário logado: carrega dados do Firestore
                    const userData = await getUserById(firebaseUser.uid);
                    const appUser = {
                        id: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName || userData?.displayName || 'Usuário',
                        ...userData,
                    };
                    setUser(appUser);
                    // Salva no localStorage para referência rápida
                    localStorage.setItem('mc_user', JSON.stringify(appUser));
                } else {
                    // Usuário deslogado
                    setUser(null);
                    localStorage.removeItem('mc_user');
                }
            });

            return () => unsubscribe();
        } catch (error) {
            console.error("Failed to load session", error);
        }
    };
    init();
  }, []);

  // Fetch Data from API when User Changes
  useEffect(() => {
      const fetchData = async () => {
          if (!user) {
              setTransactions([]);
              setBanks([]);
              setInvestments([]);
              setCategories([]);
              return;
          }

          setIsLoading(true);
          try {
                  // Parallel Fetching for efficiency
                  // DEBUG: Log DataService to diagnose runtime issues where getTransactions isn't a function
                  try {
                    // eslint-disable-next-line no-console
                    console.debug('DataService at fetch time:', DataService);
                    // eslint-disable-next-line no-console
                    console.debug('typeof DataService.getTransactions:', typeof (DataService as any).getTransactions);
                  } catch (logErr) {
                    // ignore logging errors
                  }

                  const [txs, cats, bks, invs] = await Promise.all([
                      (DataService as any).getTransactions(user.id),
                      (DataService as any).getCategories(user.id),
                      (DataService as any).getBanks(user.id),
                      (DataService as any).getInvestments(user.id)
                  ]);

              setTransactions(txs);
              setCategories(cats);
              setBanks(bks);
              setInvestments(invs);
          } catch (e) {
              console.error("Error fetching data:", e);
          } finally {
              setIsLoading(false);
          }
      };

      fetchData();
  }, [user]);

  // Persist Theme (UI Preference, usually strictly local is fine, or update user profile)
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('mc_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // --- AUTH ACTIONS ---

  const login = async (email: string, password?: string) => {
    const loggedUser = await AuthService.login(email, password);
    setUser(loggedUser);
    localStorage.setItem('mc_user', JSON.stringify(loggedUser));
    if ((loggedUser as any).theme) setTheme((loggedUser as any).theme);
  };

  const register = async (name: string, email: string, password?: string) => {
     const newUser = await AuthService.register(name, email, password);
     setUser(newUser);
     localStorage.setItem('mc_user', JSON.stringify(newUser));
  }

  const updateUserProfile = async (name: string, timezone: string) => {
      if(!user) return;
      const updated = { ...user, displayName: name };
      // Call API
      const result = await AuthService.updateUser(updated);
      setUser(result);
      localStorage.setItem('mc_user', JSON.stringify(result));
  }

  const uploadAvatar = async (file: File): Promise<void> => {
      // In a real DB app, this would upload to S3/Firebase Storage and get a URL
      // For now, we simulate by converting to Base64 and updating the User object
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = async () => {
              if(!user) return reject("No user");
              const base64 = reader.result as string;
              
              const updated = { ...user, photoURL: base64 };
              try {
                  const result = await AuthService.updateUser(updated);
                  setUser(result);
                  localStorage.setItem('mc_user', JSON.stringify(result));
                  resolve();
              } catch (e) { reject(e); }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
      });
  };
  
  const changePassword = async (oldPass: string, newPass: string) => {
      if(!user) throw new Error("Not logged in");
      await AuthService.changePassword(user.id, oldPass, newPass);
  };

  const resetPassword = async (email: string, newPass: string) => {
      await AuthService.resetPassword(email, newPass);
  };

  const deleteAccount = async (password: string) => {
    if (!user) throw new Error("Usuário não autenticado.");
    
    // Delete account from database
    await AuthService.deleteAccount(user.id, password);
    
    // Delete all user data
    await DataService.deleteAllUserData(user.id);
    
    // Clear local state and logout
    logout();
  };

  const logout = () => {
    AuthService.logout().catch(err => console.error('Erro ao fazer logout:', err));
    setUser(null);
    localStorage.removeItem('mc_user');
    setTransactions([]);
    setBanks([]);
    setInvestments([]);
    setCategories([]);
  };

  // --- DATA ACTIONS ---
  // NOTE: All actions now update the API first, then Local State

  const addTransaction = async (t: Omit<Transaction, 'id'>, recurrence?: { frequency: string, times: number }) => {
    if (!user) return;
    const newTxList: Transaction[] = [];
    const bankUpdates: {id: string, balance: number}[] = [];
    
    // Logic for generating transaction objects...
    // 1. Transfers
    if (t.type === 'transfer' && t.toBankId) {
       const transferTx: Transaction = { ...t, id: generateId(), categoryId: SYSTEM_CATEGORY_ID };
       newTxList.push(transferTx);
       
       const source = banks.find(b => b.id === t.bankId);
       const dest = banks.find(b => b.id === t.toBankId);
       if(source) bankUpdates.push({ id: source.id, balance: source.balance - t.amount });
       if(dest) bankUpdates.push({ id: dest.id, balance: dest.balance + t.amount });
    } 
    // 2. Recurring
    else if (recurrence && recurrence.times > 1) {
        const groupId = generateId();
        const originalDate = new Date(t.date);

        for (let i = 0; i < recurrence.times; i++) {
            const newDate = new Date(originalDate);
            if (recurrence.frequency === 'daily') newDate.setDate(newDate.getDate() + i);
            if (recurrence.frequency === 'weekly') newDate.setDate(newDate.getDate() + (i * 7));
            if (recurrence.frequency === 'monthly') newDate.setMonth(newDate.getMonth() + i);
            if (recurrence.frequency === 'yearly') newDate.setFullYear(newDate.getFullYear() + i);

            const tx: Transaction = {
                ...t,
                id: generateId(),
                date: newDate.toISOString(),
                recurrenceGroupId: groupId,
                recurrenceFrequency: recurrence.frequency as any
            };
            newTxList.push(tx);
        }

        if (!t.isCreditCard) {
            const totalAmount = newTxList.reduce((acc, curr) => acc + curr.amount, 0);
            const b = banks.find(b => b.id === t.bankId);
            if(b) {
                const factor = t.type === 'income' ? 1 : -1;
                bankUpdates.push({ id: b.id, balance: b.balance + (totalAmount * factor) });
            }
        }
    }
    // 3. Credit Card Installments
    else if (t.isCreditCard && t.type === 'expense') {
        const bank = banks.find(b => b.id === t.bankId);
        const closingDay = bank?.creditCardClosingDay || 1;
        const dueDay = bank?.creditCardDueDay || 10;
        
        const purchaseDate = new Date(t.date);
        const purchaseDay = purchaseDate.getDate();
        
        let targetMonth = purchaseDate.getMonth();
        let targetYear = purchaseDate.getFullYear();

        if (purchaseDay > closingDay) {
            targetMonth++;
            if (targetMonth > 11) {
                targetMonth = 0;
                targetYear++;
            }
        }

        const numInstallments = t.installments && t.installments > 0 ? t.installments : 1;
        const installmentAmount = t.amount / numInstallments;
        const parentId = generateId();

        for (let i = 0; i < numInstallments; i++) {
            let instMonth = targetMonth + i;
            let instYear = targetYear;
            while (instMonth > 11) { instMonth -= 12; instYear++; }

            const dueDate = new Date(instYear, instMonth, dueDay);
            
            newTxList.push({
                ...t,
                id: i === 0 ? parentId : generateId(),
                originalTransactionId: parentId,
                amount: installmentAmount,
                date: dueDate.toISOString(), 
                installmentNumber: i + 1,
                installments: numInstallments,
                description: numInstallments > 1 ? `${t.description}` : t.description,
                notes: `Compra em ${purchaseDate.toLocaleDateString('pt-BR')} (Parcela ${i+1}/${numInstallments})`
            });
        }
    } 
    // 4. Standard
    else {
      newTxList.push({ ...t, id: generateId() });
      if (!t.isCreditCard) {
          const b = banks.find(b => b.id === t.bankId);
          if (b) {
            const factor = t.type === 'income' ? 1 : -1;
            bankUpdates.push({ id: b.id, balance: b.balance + (t.amount * factor) });
          }
      }
    }

    // --- API CALLS ---
    const createdTxs = await DataService.createTransactionsBatch(user.id, newTxList);
    if (bankUpdates.length > 0) {
        await DataService.updateBankBalances(user.id, bankUpdates);
    }

    // --- STATE UPDATES ---
    // Use the transactions returned from Firestore (which have correct IDs)
    setTransactions(prev => [...createdTxs, ...prev]);
    if (bankUpdates.length > 0) {
        setBanks(prev => prev.map(b => {
            const update = bankUpdates.find(u => u.id === b.id);
            return update ? { ...b, balance: update.balance } : b;
        }));
    }
  };

  const deleteTransaction = async (id: string, deleteFutureSeries: boolean = false) => {
    if(!user) return;
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    let idsToDelete = [id];

    if (tx.isCreditCard && (tx.installments || 0) > 1) {
        const rootId = tx.originalTransactionId || tx.id;
        idsToDelete = transactions
            .filter(t => t.id === rootId || t.originalTransactionId === rootId)
            .map(t => t.id);
    }
    else if (deleteFutureSeries && tx.recurrenceGroupId) {
        const txDate = new Date(tx.date);
        idsToDelete = transactions
            .filter(t => t.recurrenceGroupId === tx.recurrenceGroupId && new Date(t.date) >= txDate)
            .map(t => t.id);
    }

    const txsToDelete = transactions.filter(t => idsToDelete.includes(t.id));
    const bankUpdates: {id: string, balance: number}[] = [];

    // Reverse Balance Calculation
    txsToDelete.forEach(curr => {
        if (curr.type === 'transfer' && curr.toBankId) {
            const source = banks.find(b => b.id === curr.bankId);
            const dest = banks.find(b => b.id === curr.toBankId);
            // We need to use the LATEST known balance (from current state) for accumulation if multiple tx affect same bank
            // Simple approach: calculate deltas
        }
    });

    // Re-calculating bank balances correctly is complex when batch deleting.
    // For simplicity in this demo, we iterate state.
    // In production, the backend handles transaction rollbacks.
    let tempBanks = [...banks];
    txsToDelete.forEach(curr => {
         if (curr.type === 'transfer' && curr.toBankId) {
             const sIdx = tempBanks.findIndex(b => b.id === curr.bankId);
             const dIdx = tempBanks.findIndex(b => b.id === curr.toBankId);
             if(sIdx > -1) tempBanks[sIdx].balance += curr.amount;
             if(dIdx > -1) tempBanks[dIdx].balance -= curr.amount;
         } else if (!curr.isCreditCard) {
             const idx = tempBanks.findIndex(b => b.id === curr.bankId);
             if(idx > -1) {
                 const factor = curr.type === 'income' ? -1 : 1; // Reverse logic
                 tempBanks[idx].balance += (curr.amount * factor);
             }
         }
    });

    // API Calls
    await DataService.deleteTransactions(user.id, idsToDelete);
    // Identify changed banks to push updates
    const changedBanks = tempBanks.filter(tb => {
        const original = banks.find(b => b.id === tb.id);
        return original && original.balance !== tb.balance;
    });
    if(changedBanks.length > 0) {
        await DataService.updateBankBalances(user.id, changedBanks.map(b => ({id: b.id, balance: b.balance})));
    }

    // State Updates
    setTransactions(prev => prev.filter(t => !idsToDelete.includes(t.id)));
    setBanks(tempBanks);
  };

  const updateTransaction = async (t: Transaction) => {
    if(!user) return;
    // Note: Deep logic for balance updates on edit is omitted for brevity, 
    // assuming simple text/category edits or that backend handles logic.
    // In a full app, you'd reverse old transaction effect and apply new one.
    
    const updatedTransaction = await DataService.updateTransaction(user.id, t);
    setTransactions(prev => prev.map(curr => curr.id === t.id ? updatedTransaction : curr));
  };

  const payInvoice = async (cardId: string, amount: number, paymentDate: Date, sourceBankId: string, isFullPayment: boolean) => {
    if(!user) return;
    
    // 1. Calculate new balance for source bank
    const sourceBank = banks.find(b => b.id === sourceBankId);
    if (!sourceBank) return;
    const newSourceBalance = sourceBank.balance - amount;

    // 2. Prepare Transactions
    const expenseTx: Transaction = {
      id: generateId(),
      description: 'Pagamento de Fatura',
      amount: amount,
      date: paymentDate.toISOString(),
      type: 'expense',
      categoryId: SYSTEM_CATEGORY_ID, 
      bankId: sourceBankId, 
      isCreditCard: false,
      isReconciled: true,
      notes: `Débito para pagamento do cartão ${banks.find(b => b.id === cardId)?.name}`
    };

    const incomeTx: Transaction = {
        id: generateId(),
        description: 'Crédito de Pagamento',
        amount: amount,
        date: paymentDate.toISOString(),
        type: 'income',
        categoryId: SYSTEM_CATEGORY_ID,
        bankId: cardId,
        isCreditCard: true,
        isReconciled: true,
        notes: `Pagamento recebido via conta ${sourceBank.name}`
    };

    let newTxs = [expenseTx, incomeTx];
    let txsToUpdate: Transaction[] = [];

    // 3. Handle Full Payment Reconciliation
    if (isFullPayment) {
        const payMonth = paymentDate.getMonth();
        const payYear = paymentDate.getFullYear();
        
        // Find transactions to update
        transactions.forEach(t => {
             if (t.bankId === cardId && t.isCreditCard && !t.isReconciled && t.type === 'expense') {
                const tDate = new Date(t.date);
                if (tDate.getFullYear() < payYear || (tDate.getFullYear() === payYear && tDate.getMonth() <= payMonth)) {
                    txsToUpdate.push({ ...t, isReconciled: true });
                }
            }
        });
    }

    // API Calls
    await DataService.updateBankBalance(user.id, sourceBankId, newSourceBalance);
    await DataService.createTransactionsBatch(user.id, newTxs);
    // Batch update reconciled transactions
    for (const t of txsToUpdate) {
        await DataService.updateTransaction(user.id, t);
    }

    // State Updates
    setBanks(prev => prev.map(b => b.id === sourceBankId ? { ...b, balance: newSourceBalance } : b));
    setTransactions(prev => {
        const updatedIds = txsToUpdate.map(t => t.id);
        const merged = prev.map(p => updatedIds.includes(p.id) ? { ...p, isReconciled: true } : p);
        return [...newTxs, ...merged];
    });
  };

  const addCategory = async (name: string, type: 'income' | 'expense') => {
    if(!user) return;
    const color = GITHUB_COLORS[categories.length % GITHUB_COLORS.length];
    const categoryData = { name, color, type };
    
    // Firestore gera o ID automaticamente e retorna
    const newCat = await DataService.createCategory(user.id, categoryData);
    setCategories(prev => [...prev, newCat]);
  };

  const updateCategory = async (c: Category) => {
    if(!user) return;
    await DataService.updateCategory(user.id, c);
    setCategories(prev => prev.map(cat => cat.id === c.id ? c : cat));
  };

  const deleteCategory = async (id: string) => {
    if(!user) return;
    const inUse = transactions.some(t => t.categoryId === id);
    if(inUse) {
        alert("Não é possível excluir categoria em uso.");
        return;
    }
    await DataService.deleteCategory(user.id, id);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const addBank = async (bank: Omit<Bank, 'id'>) => {
    if(!user) return;
    // Firestore gera o ID automaticamente
    const newBank = await DataService.saveBank(user.id, bank as any);
    setBanks(prev => [...prev, newBank]);
  };

  const updateBank = async (bank: Bank) => {
    if(!user) return;
    await DataService.saveBank(user.id, bank); // Save handles insert/update in our mock
    setBanks(prev => prev.map(b => b.id === bank.id ? bank : b));
  };

  const deleteBank = async (id: string) => {
    if(!user) return;
    await DataService.deleteBank(user.id, id);
    setBanks(prev => prev.filter(b => b.id !== id));
  };

  const addInvestment = async (inv: Omit<Investment, 'id'>) => {
    if(!user) return;
    // Firestore gera o ID automaticamente
    const newInv = await DataService.saveInvestment(user.id, inv as any);
    setInvestments(prev => [...prev, newInv]);
  };

  const updateInvestment = async (inv: Investment) => {
    if(!user) return;
    await DataService.saveInvestment(user.id, inv);
    setInvestments(prev => prev.map(i => i.id === inv.id ? inv : i));
  };

  const deleteInvestment = async (id: string) => {
    if(!user) return;
    await DataService.deleteInvestment(user.id, id);
    setInvestments(prev => prev.filter(i => i.id !== id));
  };

  const handleInvestmentTransaction = async (investmentId: string, amount: number, type: 'in' | 'out') => {
    if(!user) return;
    const investment = investments.find(i => i.id === investmentId);
    if (!investment) return;

    // Calc new values
    const newPrincipal = type === 'in' ? investment.principal + amount : Math.max(0, investment.principal - amount);
    const updatedInv = { ...investment, principal: newPrincipal };

    const bank = banks.find(b => b.id === investment.bankId);
    if(!bank) return;
    
    const newBankBalance = type === 'in' ? bank.balance - amount : bank.balance + amount;

    const tx: Transaction = {
      id: generateId(),
      description: type === 'in' ? `Aporte: ${investment.name}` : `Resgate: ${investment.name}`,
      amount: amount,
      date: new Date().toISOString(),
      type: 'transfer', 
      categoryId: SYSTEM_CATEGORY_ID, 
      bankId: investment.bankId,
      isCreditCard: false,
      isReconciled: true
    };

    // API
    await DataService.saveInvestment(user.id, updatedInv);
    await DataService.updateBankBalance(user.id, bank.id, newBankBalance);
    await DataService.createTransaction(user.id, tx);

    // State
    setInvestments(prev => prev.map(i => i.id === investmentId ? updatedInv : i));
    setBanks(prev => prev.map(b => b.id === investment.bankId ? { ...b, balance: newBankBalance } : b));
    setTransactions(prev => [tx, ...prev]);
  };

  // --- GETTERS (Sync logic for UI rendering is fine) ---

  const getBankBalanceAtDate = (bankId: string, date: Date) => {
      const bank = banks.find(b => b.id === bankId);
      if (!bank) return 0;
      if (bank.type === 'credit') return 0;

      const futureTransactions = transactions.filter(t => {
          if (t.bankId !== bankId && t.toBankId !== bankId) return false;
          if (t.isCreditCard) return false; 
          const tDate = new Date(t.date);
          return tDate > date;
      });

      let calculatedBalance = bank.balance;

      futureTransactions.forEach(t => {
          if (t.type === 'transfer') {
              if (t.bankId === bankId) {
                  calculatedBalance += t.amount;
              } else if (t.toBankId === bankId) {
                  calculatedBalance -= t.amount;
              }
          } else {
              const factor = t.type === 'income' ? 1 : -1;
              calculatedBalance -= (t.amount * factor);
          }
      });

      return calculatedBalance;
  };

  const getOverallBalanceAtDate = (date: Date) => {
      return banks
        .filter(b => b.type !== 'credit')
        .reduce((acc, b) => acc + getBankBalanceAtDate(b.id, date), 0);
  };

  const getInvoiceStats = (cardId: string, date: Date): InvoiceStats => {
      const bank = banks.find(b => b.id === cardId);
      if (!bank || bank.type !== 'credit') {
          return { status: 'open', total: 0, items: [], closingDate: new Date(), dueDate: new Date() };
      }

      const viewYear = date.getFullYear();
      const viewMonth = date.getMonth();
      const closingDate = new Date(viewYear, viewMonth, bank.creditCardClosingDay || 1);
      const dueDate = new Date(viewYear, viewMonth, bank.creditCardDueDay || 10);

      const items = transactions.filter(t => {
          if (t.bankId !== cardId || !t.isCreditCard) return false;
          const tDate = new Date(t.date);
          return tDate.getUTCMonth() === viewMonth && tDate.getUTCFullYear() === viewYear;
      });

      const expenses = items.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
      const credits = items.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
      const total = expenses - credits;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      let status: 'open' | 'closed' | 'paid' | 'future' | 'overdue' = 'open';
      const currentMonthIndex = today.getFullYear() * 12 + today.getMonth();
      const viewMonthIndex = viewYear * 12 + viewMonth;

      if (total <= 0.01 && items.length > 0) {
          status = 'paid';
      } else if (viewMonthIndex > currentMonthIndex) {
          status = 'future';
      } else if (viewMonthIndex < currentMonthIndex) {
          status = 'overdue';
      } else {
          if (today > dueDate) status = 'overdue';
          else if (today > closingDate) status = 'closed';
          else status = 'open';
      }

      return { status, total, items, closingDate, dueDate };
  };

  const getDashboardStats = (date: Date): DashboardStats => {
    const targetMonth = date.getMonth();
    const targetYear = date.getFullYear();

    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const currentMonthTx = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getUTCMonth() === targetMonth && d.getUTCFullYear() === targetYear;
    });

    const income = currentMonthTx
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);

    const expenses = currentMonthTx
      .filter(t => t.type === 'expense' && !t.isCreditCard)
      .reduce((acc, t) => acc + t.amount, 0);

    const totalInvested = investments.reduce((acc, inv) => {
        if (!inv.startDate) return acc + inv.principal;
        const start = new Date(inv.startDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        let interest = 0;
        const rateDecimal = inv.rate / 100;
        
        if (inv.principal > 0) {
            if (inv.frequency === 'daily') {
                interest = inv.principal * Math.pow((1 + rateDecimal), diffDays) - inv.principal;
            } else if (inv.frequency === 'monthly') {
                interest = inv.principal * Math.pow((1 + rateDecimal), diffDays / 30) - inv.principal;
            } else {
                interest = inv.principal * Math.pow((1 + rateDecimal), diffDays / 365) - inv.principal;
            }
        }
        return acc + inv.principal + interest;
    }, 0);

    const creditCardBill = banks
        .filter(b => b.type === 'credit')
        .reduce((acc, card) => acc + getInvoiceStats(card.id, date).total, 0);

    const balance = getOverallBalanceAtDate(endOfMonth);

    return { income, expenses, balance, investments: totalInvested, creditCardBill };
  };

  return (
    <AppContext.Provider value={{
      user, theme, isLoading, toggleTheme, login, register, updateUserProfile, uploadAvatar, changePassword, resetPassword, deleteAccount, logout, transactions, categories, banks, investments,
      addTransaction, deleteTransaction, updateTransaction, payInvoice,
      addCategory, updateCategory, deleteCategory,
      addBank, updateBank, deleteBank,
      addInvestment, updateInvestment, deleteInvestment, handleInvestmentTransaction,
      getDashboardStats, getBankBalanceAtDate, getOverallBalanceAtDate, getInvoiceStats
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

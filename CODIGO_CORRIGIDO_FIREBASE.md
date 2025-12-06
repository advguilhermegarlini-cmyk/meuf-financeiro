# 🔧 CÓDIGO CORRIGIDO - FIREBASE TRANSAÇÕES

## 1. services/firestoreData.ts - CORRIGIDO

```typescript
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

  // ✅ CORRIGIDO: Retornar resultado do Firestore
  async createTransaction(userId: string, transaction: any) {
    const tx = { ...transaction, date: normalizeDate(transaction.date) };
    const result = await txSvc.createTransaction(userId, tx);
    return result;  // ✅ Retorna com ID do Firestore!
  },

  // ✅ CORRIGIDO: Usar resultado do Firestore para cada transação
  async createTransactionsBatch(userId: string, transactions: any[]) {
    const created: any[] = [];
    for (const t of transactions) {
      const tx = { ...t, date: normalizeDate(t.date) };
      const result = await txSvc.createTransaction(userId, tx);
      created.push(result);  // ✅ Resultado com ID do Firestore!
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
    try {
      await userSvc.deleteUser(userId);
    } catch (e) {
      console.warn('Failed to delete user doc, falling back to local cleanup', e);
    }
    await LocalDataService.deleteAllUserData(userId);
  }
};
```

---

## 2. src/services/transactions.js - PARTE IMPORTANTE

```javascript
const cleanData = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  );
};

/**
 * ✅ CORRIGIDO: Retornar com ID e dados do Firestore
 */
export const createTransaction = async (uid, transactionData) => {
  try {
    console.log(`🚀 [createTransaction] Iniciando para UID: ${uid}`);
    
    const txRef = getTransactionsCollection(uid);
    const cleanedData = cleanData(transactionData);
    
    const dataToSave = {
      ...cleanedData,
      createdAt: getServerTimestamp(),
      updatedAt: getServerTimestamp(),
    };
    
    console.log(`📝 [createTransaction] Salvando no Firestore:`, dataToSave);
    const docRef = await addDoc(txRef, dataToSave);
    console.log(`✅ [createTransaction] Transação salva com ID: ${docRef.id}`);
    
    // ✅ Retorna com ID correto do Firestore
    return { 
      id: docRef.id, 
      ...cleanedData, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
  } catch (error) {
    console.error(`❌ [createTransaction] ERRO:`, error);
    throw error;
  }
};
```

---

## 3. context.tsx - addTransaction CORRIGIDO

```typescript
const addTransaction = async (
  t: Omit<Transaction, 'id'>, 
  recurrence?: { frequency: string, times: number }
) => {
  if (!user) return;
  
  // ✅ SEM IDs locais - deixar Firestore gerar!
  const newTxList: Omit<Transaction, 'id'>[] = [];
  const bankUpdates: {id: string, balance: number}[] = [];
  
  // ... lógica de build da lista ...
  
  // --- API CALLS ---
  console.log('📤 Enviando', newTxList.length, 'transações para o Firestore...');
  try {
    const createdTxs = await DataService.createTransactionsBatch(user.id, newTxList);
    console.log('✅ Transações criadas no Firestore:', createdTxs);
    
    if (bankUpdates.length > 0) {
      await DataService.updateBankBalances(user.id, bankUpdates);
    }

    // --- STATE UPDATES ---
    setTransactions(prev => [...createdTxs, ...prev]);
    if (bankUpdates.length > 0) {
      setBanks(prev => prev.map(b => {
        const update = bankUpdates.find(u => u.id === b.id);
        return update ? { ...b, balance: update.balance } : b;
      }));
    }
  } catch (error) {
    console.error('❌ ERRO ao adicionar transação:', error);
    throw error;
  }
};
```

---

## 4. firestore.rules - PERMISSÕES CORRETAS

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isOwner(uid) {
      return request.auth.uid == uid;
    }
    
    // === Perfil do Usuário ===
    match /users/{uid} {
      allow read: if request.auth != null && isOwner(uid);
      allow create: if request.auth != null && isOwner(uid);
      allow update: if request.auth != null && isOwner(uid);
      allow delete: if request.auth != null && isOwner(uid);
      
      // === TRANSAÇÕES ===
      match /transactions/{transactionId} {
        allow read: if request.auth != null && isOwner(uid);
        allow create: if request.auth != null && isOwner(uid);
        allow update: if request.auth != null && isOwner(uid);
        allow delete: if request.auth != null && isOwner(uid);
      }
      
      // === CARTÕES ===
      match /cards/{cardId} {
        allow read: if request.auth != null && isOwner(uid);
        allow create: if request.auth != null && isOwner(uid);
        allow update: if request.auth != null && isOwner(uid);
        allow delete: if request.auth != null && isOwner(uid);
      }
      
      // === CATEGORIAS ===
      match /categories/{categoryId} {
        allow read: if request.auth != null && isOwner(uid);
        allow create: if request.auth != null && isOwner(uid);
        allow update: if request.auth != null && isOwner(uid);
        allow delete: if request.auth != null && isOwner(uid);
      }
      
      // === BANCOS ===
      match /banks/{bankId} {
        allow read: if request.auth != null && isOwner(uid);
        allow create: if request.auth != null && isOwner(uid);
        allow update: if request.auth != null && isOwner(uid);
        allow delete: if request.auth != null && isOwner(uid);
      }
      
      // === INVESTIMENTOS ===
      match /investments/{investmentId} {
        allow read: if request.auth != null && isOwner(uid);
        allow create: if request.auth != null && isOwner(uid);
        allow update: if request.auth != null && isOwner(uid);
        allow delete: if request.auth != null && isOwner(uid);
      }
    }
    
    // Bloquear tudo mais
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 📋 VERIFICAÇÃO RÁPIDA

### Se após seguir este guia as transações AINDA não forem salvas:

1. **Abra F12 (DevTools)**
2. **Procure pelos logs:**
   - Se vir `✅ Transação salva com ID` = Está salvando
   - Se vir `❌ ERRO` = Há erro, verifique qual
   - Se não vir nada = função não está sendo chamada

3. **Vá para Firebase Console**
4. **Firestore → users → seu-UID → transactions**
5. **Se está vazio** = não está salvando

---

**PRÓXIMA AÇÃO:** Implementar estes códigos e testar!

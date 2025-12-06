/**
 * Script de debug para verificar se transações estão sendo salvas no Firestore
 * Execute isto no console do navegador (F12) quando estiver logado
 */

// Copie e cole isto no console do navegador:

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Substitua com suas credenciais do firebase.js
const firebaseConfig = {
  // ... suas credenciais
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Function para listar transações
async function verificarTransacoes() {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('❌ Usuário não autenticado!');
      return;
    }

    console.log(`🔍 Verificando transações para UID: ${user.uid}`);
    
    const txRef = collection(db, 'users', user.uid, 'transactions');
    const q = query(txRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    
    console.log(`✅ Total de transações no Firestore: ${snapshot.size}`);
    
    if (snapshot.empty) {
      console.warn('⚠️ Nenhuma transação encontrada!');
    } else {
      snapshot.docs.forEach((doc, index) => {
        console.log(`\n📄 Transação ${index + 1}:`);
        console.log('   ID:', doc.id);
        console.log('   Dados:', doc.data());
      });
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Execute a função
verificarTransacoes();

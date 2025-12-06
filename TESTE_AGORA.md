# 🧪 TESTE AGORA - 5 MINUTOS

## Passo 1: Abra a Aplicação
1. Vá para: https://meu-financeiro-331e4.web.app
2. Faça login (use sua conta)

## Passo 2: Abra o Console (F12)
```
Windows/Linux: F12
Mac: Cmd + Option + I
```

## Passo 3: Cole ESTE código no Console e execute:

```javascript
// ============================================
// TESTE 1: Verificar Autenticação Firebase
// ============================================
console.log('🔐 TESTE 1: Verificando autenticação...');

import { getAuth } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const auth = getAuth();
const db = getFirestore();

if (auth.currentUser) {
  console.log('✅ AUTENTICADO');
  console.log('UID:', auth.currentUser.uid);
} else {
  console.log('❌ NÃO AUTENTICADO');
}

// ============================================
// TESTE 2: Contar Transações no Firestore
// ============================================
console.log('\n📊 TESTE 2: Contando transações...');

if (auth.currentUser) {
  const txRef = collection(db, 'users', auth.currentUser.uid, 'transactions');
  const snapshot = await getDocs(txRef);
  console.log(`✅ Encontradas ${snapshot.size} transações no Firestore`);
  
  if (snapshot.size > 0) {
    console.log('\n📝 Primeiras 5 transações:');
    snapshot.docs.slice(0, 5).forEach((doc, i) => {
      console.log(`${i+1}. ${doc.data().description} - R$ ${doc.data().value}`);
    });
  } else {
    console.log('⚠️ Nenhuma transação encontrada');
  }
} else {
  console.log('❌ Faça login primeiro');
}

// ============================================
// TESTE 3: Criar Transação de Teste
// ============================================
console.log('\n✏️ TESTE 3: Criando transação de teste...');

import { addDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

if (auth.currentUser) {
  try {
    const testTx = {
      description: `TESTE ${new Date().getHours()}:${new Date().getMinutes()}`,
      value: 99.99,
      type: 'expense',
      category: 'test',
      date: new Date().toISOString(),
      userId: auth.currentUser.uid,
      paid: false,
      recurring: false,
      tags: [],
    };
    
    const txRef = collection(db, 'users', auth.currentUser.uid, 'transactions');
    const docRef = await addDoc(txRef, testTx);
    
    console.log('✅ Transação criada com sucesso!');
    console.log('ID:', docRef.id);
    console.log('Dados:', testTx);
  } catch (error) {
    console.error('❌ Erro ao criar transação:', error.message);
  }
} else {
  console.log('❌ Faça login primeiro');
}

// ============================================
// RESUMO
// ============================================
console.log('\n' + '='.repeat(50));
console.log('🎯 RESULTADOS DO TESTE');
console.log('='.repeat(50));
console.log('Se tudo é ✅: Problema foi corrigido!');
console.log('Se viu ❌: Há problema de permissões');
```

## Passo 4: Analise os Resultados

### ✅ Se viu tudo em VERDE:
```
✅ AUTENTICADO
✅ Encontradas X transações
✅ Transação criada com sucesso
```
→ **PARABÉNS! O Firebase está salvando tudo!**

### ❌ Se viu erro de "permissions":
```
❌ Missing or insufficient permissions
```
→ Vá em `FIREBASE_CONSOLE_PASSO_A_PASSO.md` → **Passo 8: Firestore Rules**

## Passo 5: Teste na Aplicação

1. **Crie uma transação** no app
2. **Recarregue a página** (Ctrl+R)
3. **A transação aparece?**
   - ✅ SIM → Problema resolvido!
   - ❌ NÃO → Veja próximos passos

## Se Ainda Não Funcionar

1. Esvazie o cache do navegador (Ctrl+Shift+Delete)
2. Faça um logout/login
3. Tente novamente

---

**Tempo total:** ~5 minutos  
**Próximo passo:** Se passou aqui com ✅, a aplicação está funcionando!

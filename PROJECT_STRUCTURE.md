/**
 * ESTRUTURA COMPLETA DO PROJETO FIREBASE + REACT + VITE
 * 
 * Este arquivo resume todos os arquivos criados e suas responsabilidades.
 */

// ============================================================================
// 📦 ARQUIVOS CRIADOS
// ============================================================================

// 1. INICIALIZAÇÃO FIREBASE
// ├── src/firebase.js
//     └─ Inicializa Firebase com Firestore e Auth
//     └─ Exporta: auth, db, app

// 2. HELPERS (Funções Auxiliares)
// ├── src/helpers/index.js
//     ├─ addMonthsToDate() → Adiciona meses a uma data (trata fevereiro)
//     ├─ formatCurrency() → Formata valores em BRL
//     ├─ formatDate() → Formata datas em pt-BR
//     ├─ getServerTimestamp() → Retorna timestamp do servidor
//     └─ generateId() → Gera IDs únicos

// 3. HOOKS (Lógica de Autenticação)
// ├── src/hooks/useAuth.js
//     ├─ user → Usuário autenticado
//     ├─ userData → Dados do usuário no Firestore
//     ├─ loading → Estado de carregamento
//     ├─ error → Mensagens de erro
//     ├─ login() → Faz login
//     ├─ signup() → Cria nova conta
//     ├─ logout() → Faz logout
//     └─ updateUserData() → Atualiza perfil

// 4. SERVIÇOS (CRUD)
// ├── src/services/users.js
//     ├─ createOrUpdateUser()
//     ├─ getUserById()
//     ├─ getAllUsers()
//     ├─ updateUser()
//     ├─ deleteUser()
//     └─ getUsersByEmail()
//
// ├── src/services/cards.js
//     ├─ createCard()
//     ├─ getCardsByUserId()
//     ├─ getCardById()
//     ├─ updateCard()
//     ├─ deleteCard()
//     └─ getTotalCardBalance()
//
// ├── src/services/transactions.js
//     ├─ createTransaction() → Transação simples
//     ├─ createInstallmentTransaction() → Com parcelamento
//     ├─ getTransactionsByUserId()
//     ├─ getTransactionsByDateRange()
//     ├─ getTransactionsByType()
//     ├─ getTransactionById()
//     ├─ getInstallmentsByGroupId() → Todas as parcelas
//     ├─ updateTransaction()
//     ├─ deleteTransaction()
//     ├─ deleteInstallmentGroup() → Deleta todas as parcelas
//     └─ getSummaryByMonth() → Resumo mensal (receita/despesa)

// 5. COMPONENTES (UI)
// ├── src/components/CardsList.jsx
//     └─ Listar, criar, atualizar e deletar cartões
//
// ├── src/components/TransactionsList.jsx
//     └─ Listar, criar (simples e parcelada) e deletar transações
//
// └── src/components/UsersList.jsx
//     └─ Listar usuários (admin example)

// 6. CONFIGURAÇÃO
// ├── firestore.rules
//     └─ Regras de segurança do Firestore
//
// ├── .env.example
//     └─ Template de variáveis de ambiente
//
// ├── App.jsx.example
//     └─ Exemplo completo de uso
//
// └── FIREBASE_SETUP.md
//     └─ Guia de instalação e uso

// ============================================================================
// 🗄️ ESTRUTURA DO FIRESTORE
// ============================================================================

/*
/users/{uid}
  ├─ email: string
  ├─ displayName: string
  ├─ createdAt: timestamp
  ├─ updatedAt: timestamp
  │
  └─ /cards/{cardId}
      ├─ name: string
      ├─ number: string
      ├─ balance: number
      ├─ limit: number
      ├─ expiryDate: string
      ├─ createdAt: timestamp
      └─ updatedAt: timestamp
  │
  └─ /transactions/{transactionId}
      ├─ description: string
      ├─ amount: number
      ├─ type: 'income' | 'expense'
      ├─ cardId: string
      ├─ category: string
      ├─ date: timestamp
      ├─ groupId: string (para parcelas)
      ├─ installmentNumber: number (ex: 1 de 3)
      ├─ totalInstallments: number (ex: 3)
      ├─ createdAt: timestamp
      └─ updatedAt: timestamp
*/

// ============================================================================
// 🔐 FIRESTORE RULES - SEGURANÇA
// ============================================================================

/*
✅ Cada usuário só acessa seus próprios dados
✅ Validação de tipos e campos obrigatórios
✅ Operações CRUD isoladas por usuário
✅ Subcoleções protegidas (cards, transactions)

Estrutura de segurança:
- /users/{uid} → Perfil (isolado)
- /users/{uid}/cards/{cardId} → Cartões (isolados)
- /users/{uid}/transactions/{txId} → Transações (isoladas)
*/

// ============================================================================
// 📖 EXEMPLOS DE USO
// ============================================================================

// Exemplo 1: Login
// -------
// const { user, login } = useAuth();
// await login('usuario@email.com', 'senha123');

// Exemplo 2: Criar transação simples
// -------
// import { createTransaction } from '@/services/transactions';
// 
// const txId = await createTransaction(user.uid, {
//   description: 'Compra no mercado',
//   amount: 150.00,
//   type: 'expense',
//   cardId: 'card_123',
//   category: 'Alimentação',
//   date: new Date(),
// });

// Exemplo 3: Criar transação parcelada (3x)
// -------
// import { createInstallmentTransaction } from '@/services/transactions';
// 
// const groupId = await createInstallmentTransaction(
//   user.uid,
//   {
//     description: 'Compra parcelada',
//     amount: 3000.00,
//     type: 'expense',
//     cardId: 'card_456',
//     category: 'Eletrônicos',
//     date: new Date(),
//   },
//   3 // 3 parcelas (cria 3 documentos com datas diferentes)
// );

// Exemplo 4: Obter resumo mensal
// -------
// import { getSummaryByMonth } from '@/services/transactions';
// 
// const summary = await getSummaryByMonth(user.uid, 2024, 11);
// console.log(summary); // { income: 5000, expense: 2500, total: 2500, ... }

// Exemplo 5: Listar cartões
// -------
// import { getCardsByUserId } from '@/services/cards';
// 
// const cards = await getCardsByUserId(user.uid);
// console.log(cards); // Array de cartões do usuário

// ============================================================================
// 🚀 PRÓXIMOS PASSOS
// ============================================================================

/*
1. ✅ Instalar dependências: npm install
2. ✅ Criar projeto no Firebase Console
3. ✅ Copiar .env.example para .env.local
4. ✅ Preencher credenciais do Firebase
5. ✅ Importar firestore.rules no Firebase Console
6. ✅ Iniciar dev server: npm run dev
7. ✅ Usar os componentes e serviços na sua aplicação

Estrutura pronta para:
- ✅ Desenvolvimento local
- ✅ Deploy no Firebase Hosting
- ✅ Deploy no Vercel
- ✅ Escalabilidade
- ✅ Segurança
*/

// ============================================================================
// 📝 NOTAS IMPORTANTES
// ============================================================================

/*
1. Parcelamento: O sistema cria N documentos separados, cada um com data
   diferente. Útil para transações que ocorrem em múltiplos meses.

2. Isolamento: Usa subcoleções para garantir que dados de um usuário não
   são acessíveis por outro.

3. Tipo de dados: Todas as funções usam TypeScript-compatible types,
   mas o código é JavaScript puro para máxima compatibilidade.

4. Timestamps: Usa serverTimestamp() do Firestore para evitar problemas
   de sincronização de relógio.

5. Batch operations: deleteInstallmentGroup() usa writeBatch para
   operações atômicas.

6. Validação: Todas as operações validam dados antes de enviar ao Firestore.
*/

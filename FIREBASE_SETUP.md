# Meu Financeiro - Firebase + React + Vite

Um projeto completo de gestão financeira com React, Vite e Firebase Firestore.

## 📁 Estrutura do Projeto

```
src/
├── firebase.js                 # Inicialização do Firebase
├── helpers/
│   └── index.js               # Funções auxiliares (datas, moeda, etc)
├── hooks/
│   └── useAuth.js             # Hook de autenticação
├── services/
│   ├── users.js               # CRUD de usuários
│   ├── cards.js               # CRUD de cartões
│   └── transactions.js        # CRUD de transações (com parcelamento)
├── components/
│   ├── UsersList.jsx          # Componente de listagem de usuários
│   ├── CardsList.jsx          # Componente de gestão de cartões
│   └── TransactionsList.jsx   # Componente de gestão de transações
└── App.jsx                    # Componente principal da aplicação

firestore.rules               # Regras de segurança do Firestore
.env.example                  # Exemplo de variáveis de ambiente
```

## 🚀 Início Rápido

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Habilite **Authentication** (Email/Password)
3. Crie um banco de dados **Firestore** (modo de teste ou com as regras fornecidas)
4. Copie suas credenciais do Firebase

### 3. Configurar variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha com suas credenciais:

```bash
cp .env.example .env.local
```

Edite `.env.local`:

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_project_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

### 4. Importar Firestore Rules

No Firebase Console:
1. Vá para **Firestore Database** > **Rules**
2. Copie o conteúdo de `firestore.rules`
3. Cole e publique as regras

### 5. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:5173`

## 📋 Funcionalidades

### ✅ Autenticação
- Login com email/senha
- Registro de novos usuários
- Logout
- Persistência de sessão

### 🔐 Usuários
- Criação de perfil
- Atualização de dados
- Deleção de conta (e todos os dados associados)

### 💳 Cartões
- Criar, ler, atualizar e deletar cartões
- Rastrear saldo e limite
- Cada cartão vinculado ao usuário

### 💰 Transações
- Criar transações simples
- **Suporte a parcelamento** (cria múltiplos documentos com datas corretas)
- Filtrar por tipo (receita/despesa)
- Filtrar por intervalo de datas
- Deletar transações individuais ou grupos de parcelas
- Calcular resumo mensal

## 📝 Exemplos de Uso

### Criar uma Transação Simples

```javascript
import { createTransaction } from '@/services/transactions';
import { useAuth } from '@/hooks/useAuth';

const { user } = useAuth();

const transaction = await createTransaction(user.uid, {
  description: 'Compra no Supermercado',
  amount: 150.00,
  type: 'expense',
  cardId: 'card_123',
  category: 'Alimentação',
  date: new Date(),
});
```

### Criar uma Transação Parcelada (3x)

```javascript
import { createInstallmentTransaction } from '@/services/transactions';

const groupId = await createInstallmentTransaction(
  user.uid,
  {
    description: 'Compra em Loja de Eletrônicos',
    amount: 3000.00,
    type: 'expense',
    cardId: 'card_123',
    category: 'Eletrônicos',
    date: new Date(),
  },
  3 // 3 parcelas
);

// Cria 3 transações com datas diferentes:
// Parcela 1: 01/12/2024
// Parcela 2: 01/01/2025
// Parcela 3: 01/02/2025
```

### Obter Transações de um Mês

```javascript
import { getSummaryByMonth } from '@/services/transactions';

const summary = await getSummaryByMonth(user.uid, 2024, 11); // Dezembro 2024
console.log(summary);
// {
//   income: 5000,
//   expense: 2500,
//   total: 2500,
//   transactionCount: 15
// }
```

## 🔐 Segurança - Firestore Rules

As regras implementadas garantem:

1. **Isolamento por Usuário**: Cada usuário só acessa seus próprios dados
2. **Validação de Dados**: Tipos e campos obrigatórios são validados
3. **Operações Permitidas**:
   - Read: Usuário logado lê seus dados
   - Create: Usuário logado cria dados
   - Update: Usuário logado atualiza seus dados
   - Delete: Usuário logado deleta seus dados

Estrutura de segurança:
```
/users/{uid}                    → Perfil do usuário
/users/{uid}/cards/{cardId}     → Cartões (isolados)
/users/{uid}/transactions/{txId} → Transações (isoladas)
```

## 🛠️ Helpers Úteis

### Datas
```javascript
import { addMonthsToDate, formatDate } from '@/helpers';

const nextMonth = addMonthsToDate(new Date(), 1);
const formatted = formatDate(new Date()); // "05/12/2024"
```

### Moeda
```javascript
import { formatCurrency } from '@/helpers';

const formatted = formatCurrency(1500.50); // "R$ 1.500,50"
```

### IDs
```javascript
import { generateId } from '@/helpers';

const id = generateId(); // "1733376234432-a1b2c3d4"
```

## 📦 Dependências Principais

- **firebase**: SDK do Firebase
- **react**: Framework UI
- **react-dom**: Renderização React
- **vite**: Build tool

## 🚢 Deploy

### Firebase Hosting

```bash
# Build
npm run build

# Deploy
firebase deploy
```

### Vercel

```bash
npm run build
# Push para GitHub e conecte no Vercel
```

## 🐛 Troubleshooting

### Erro: "Cannot find module 'firebase'"
```bash
npm install firebase
```

### Erro: "PERMISSION_DENIED"
- Verifique se está logado no Firebase
- Confirme as `firestore.rules` estão corretas
- Certifique-se que `request.auth.uid` corresponde ao UID do usuário

### Erro: "VITE_FIREBASE_* is undefined"
- Crie `.env.local` (copiando de `.env.example`)
- Restart o servidor: `npm run dev`

## 📖 Documentação Adicional

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Rules](https://firebase.google.com/docs/firestore/security/start)
- [React Hooks](https://react.dev/reference/react)
- [Vite Guide](https://vitejs.dev/guide/)

## 📄 Licença

MIT

---

**Desenvolvido com ❤️ usando React, Vite e Firebase**

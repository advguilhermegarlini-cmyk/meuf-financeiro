# 🚀 Projeto React + Vite + Firebase Completo

Um projeto **pronto para usar** com React, Vite e Firebase Firestore.

## ✅ O QUE FOI CRIADO

### 📁 Estrutura de Pastas
```
src/
├── firebase.js                 # Inicialização do Firebase
├── helpers/index.js            # Funções auxiliares (data, moeda, etc)
├── hooks/useAuth.js            # Hook de autenticação
├── services/
│   ├── users.js               # CRUD de usuários
│   ├── cards.js               # CRUD de cartões
│   └── transactions.js        # CRUD de transações + parcelamento
└── components/
    ├── CardsList.jsx          # Gerenciamento de cartões
    ├── TransactionsList.jsx   # Gerenciamento de transações
    └── UsersList.jsx          # Listagem de usuários
```

### 📋 Arquivos de Configuração
- ✅ **firestore.rules** - Regras de segurança prontas
- ✅ **.env.example** - Template de variáveis de ambiente
- ✅ **App.jsx.example** - Exemplo completo de uso
- ✅ **FIREBASE_SETUP.md** - Guia passo-a-passo
- ✅ **PROJECT_STRUCTURE.md** - Documentação técnica

---

## 🎯 FUNCIONALIDADES IMPLEMENTADAS

### 🔐 Autenticação (useAuth.js)
```javascript
const { user, login, signup, logout, isAuthenticated } = useAuth();

// Login
await login('usuario@email.com', 'senha123');

// Signup
await signup('usuario@email.com', 'senha123', 'Nome');

// Logout
await logout();
```

### 👥 Usuários (users.js)
- ✅ Criar/atualizar perfil
- ✅ Obter usuário por ID
- ✅ Listar todos os usuários
- ✅ Deletar conta (e todos os dados)

### 💳 Cartões (cards.js)
- ✅ Criar cartão
- ✅ Listar cartões
- ✅ Atualizar cartão
- ✅ Deletar cartão
- ✅ Calcular saldo total

### 💰 Transações (transactions.js)
- ✅ **Transações simples** (única parcela)
- ✅ **Transações parceladas** (múltiplas parcelas com datas corretas)
- ✅ Filtrar por tipo (receita/despesa)
- ✅ Filtrar por intervalo de datas
- ✅ Deletar transação única ou grupo de parcelas
- ✅ Resumo mensal (receita, despesa, total)

---

## 📦 COMO USAR

### 1️⃣ Instalar Dependências
```bash
npm install
```

### 2️⃣ Configurar Firebase
1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Crie um novo projeto
3. Habilite **Authentication** (Email/Password)
4. Crie um banco de dados **Firestore**

### 3️⃣ Configurar Variáveis de Ambiente
```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais do Firebase:
```env
VITE_FIREBASE_API_KEY=xyz...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123...
VITE_FIREBASE_APP_ID=1:123:web:abc...
```

### 4️⃣ Importar Firestore Rules
1. No Firebase Console, vá para **Firestore** > **Rules**
2. Substitua o conteúdo com `firestore.rules`
3. Clique em **Publish**

### 5️⃣ Iniciar Desenvolvimento
```bash
npm run dev
```

Acesse `http://localhost:5173`

---

## 💡 EXEMPLOS DE CÓDIGO

### Criar Transação Simples
```javascript
import { createTransaction } from '@/services/transactions';

const txId = await createTransaction(user.uid, {
  description: 'Compra no supermercado',
  amount: 150.00,
  type: 'expense',
  cardId: 'card_123',
  category: 'Alimentação',
  date: new Date(),
});
```

### Criar Transação Parcelada (3x)
```javascript
import { createInstallmentTransaction } from '@/services/transactions';

const groupId = await createInstallmentTransaction(
  user.uid,
  {
    description: 'TV 55 polegadas',
    amount: 3000.00,
    type: 'expense',
    cardId: 'card_456',
    category: 'Eletrônicos',
    date: new Date('2024-12-01'),
  },
  3 // 3 parcelas
);

// Resultado: 3 transações criadas
// Parcela 1: 01/12/2024 - R$ 1.000,00
// Parcela 2: 01/01/2025 - R$ 1.000,00
// Parcela 3: 01/02/2025 - R$ 1.000,00
```

### Obter Resumo Mensal
```javascript
import { getSummaryByMonth } from '@/services/transactions';

const summary = await getSummaryByMonth(user.uid, 2024, 11);

console.log(summary);
// {
//   income: 5000.00,
//   expense: 2500.00,
//   total: 2500.00,
//   transactionCount: 15
// }
```

### Usar o Hook de Autenticação
```javascript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, loading, error, login, logout } = useAuth();

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {error}</p>;
  if (!user) return <p>Não autenticado</p>;

  return (
    <div>
      <p>Bem-vindo, {user.email}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## 🔐 Segurança (Firestore Rules)

As regras implementadas garantem:

✅ **Isolamento por Usuário**: Cada usuário só acessa seus dados
✅ **Validação de Dados**: Tipos e campos obrigatórios são validados
✅ **Permissões CRUD**: Usuários podem criar, ler, atualizar e deletar

Estrutura de segurança:
```
/users/{uid}                      → Perfil do usuário
/users/{uid}/cards/{cardId}       → Cartões (isolados)
/users/{uid}/transactions/{txId}  → Transações (isoladas)
```

---

## 🛠️ Funções Auxiliares (helpers)

```javascript
import {
  addMonthsToDate,      // Adiciona meses a uma data
  formatCurrency,       // Formata valores em BRL
  formatDate,          // Formata datas em pt-BR
  generateId,          // Gera IDs únicos
  getServerTimestamp   // Retorna timestamp do servidor
} from '@/helpers';

// Exemplos
const nextMonth = addMonthsToDate(new Date(), 1);
const formatted = formatCurrency(1500.50);  // "R$ 1.500,50"
const dateStr = formatDate(new Date());     // "05/12/2024"
const id = generateId();                    // "1733376234432-a1b2c3d4"
```

---

## 📚 Estrutura de Dados do Firestore

```
/users/{uid}
├── email: string
├── displayName: string
├── createdAt: timestamp
├── updatedAt: timestamp
│
├─ /cards/{cardId}
│  ├── name: string
│  ├── number: string
│  ├── balance: number
│  ├── limit: number
│  └── expiryDate: string
│
└─ /transactions/{transactionId}
   ├── description: string
   ├── amount: number
   ├── type: 'income' | 'expense'
   ├── cardId: string
   ├── category: string
   ├── date: timestamp
   ├── groupId: string (para parcelas)
   ├── installmentNumber: number (ex: 1 de 3)
   └── totalInstallments: number
```

---

## 🚢 Deploy

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### Vercel
```bash
npm run build
# Faça push para GitHub e conecte no Vercel
```

---

## 📖 Documentação Completa

Veja os arquivos:
- 📖 **FIREBASE_SETUP.md** - Guia passo-a-passo completo
- 📋 **PROJECT_STRUCTURE.md** - Detalhes técnicos
- 📝 **App.jsx.example** - Exemplo de uso completo

---

## 🐛 Troubleshooting

### Erro: "PERMISSION_DENIED"
✅ Certifique-se que `firestore.rules` foi importado
✅ Verifique se `request.auth.uid` está correto

### Erro: "Cannot find module"
```bash
npm install
npm run dev
```

### Env vars não reconhecidas
✅ Renomeie `.env.local` para `.env`
✅ Restart o servidor dev

---

## ✨ Recursos Principais

| Feature | Status | Arquivo |
|---------|--------|---------|
| Autenticação | ✅ | hooks/useAuth.js |
| CRUD Usuários | ✅ | services/users.js |
| CRUD Cartões | ✅ | services/cards.js |
| CRUD Transações | ✅ | services/transactions.js |
| Parcelamento | ✅ | services/transactions.js |
| Componentes | ✅ | components/* |
| Segurança | ✅ | firestore.rules |
| Helpers | ✅ | helpers/index.js |

---

## 📝 Próximos Passos Sugeridos

1. ✅ Personalizar componentes com seu design
2. ✅ Adicionar mais categorias de transações
3. ✅ Implementar gráficos de despesas
4. ✅ Adicionar exportação de relatórios
5. ✅ Implementar notificações
6. ✅ Adicionar dark mode

---

## 📄 Licença

MIT - Livre para usar e modificar

---

**Desenvolvido com ❤️ usando React + Vite + Firebase**

Para dúvidas, consulte a [documentação oficial do Firebase](https://firebase.google.com/docs)

# 🚀 COMEÇAR AGORA - 5 MINUTOS

> Guia rápido para colocar seu Firebase rodando em 5 minutos

## 1️⃣ Pré-requisitos
```bash
✓ Node.js 18+ instalado
✓ npm ou yarn
✓ Conta do Google (para Firebase)
```

## 2️⃣ Setup Local (2 min)

### Passo 1: Instalar dependências
```bash
cd C:\Users\admed\Downloads\meu-financeiro
npm install
```

### Passo 2: Configurar ambiente
```bash
# Copiar arquivo de exemplo
copy .env.example .env.local

# Editar .env.local com suas credenciais do Firebase
```

### Passo 3: Preencher .env.local
```env
VITE_FIREBASE_API_KEY=sua_chave_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_numero
VITE_FIREBASE_APP_ID=seu_app_id
```

## 3️⃣ Setup Firebase Console (2 min)

### Passo 1: Criar projeto
1. Abra https://console.firebase.google.com
2. Click "Criar projeto"
3. Nome: "meu-financeiro"
4. Continue até terminar

### Passo 2: Habilitar Authentication
1. Vá para: Authentication → Sign-in method
2. Ative: Email/Password
3. Pronto!

### Passo 3: Criar Firestore
1. Vá para: Firestore Database
2. Criar banco de dados
3. Modo: Produção
4. Localização: Deixar padrão
5. Pronto!

### Passo 4: Importar Security Rules
1. Vá para: Firestore Database → Rules
2. Copie tudo de: `firestore.rules`
3. Cole no editor do Firebase Console
4. Publish

### Passo 5: Copiar credenciais
1. Vá para: Project Settings (engrenagem)
2. Vá para: Your apps
3. Clique em seu app web
4. Copie as credenciais
5. Cole em .env.local

## 4️⃣ Rodar Localmente (1 min)

```bash
npm run dev
```

Abra: http://localhost:5173

## ✅ Pronto!

Seu app agora está:
- ✅ Conectado ao Firebase
- ✅ Com autenticação funcionando
- ✅ Com banco de dados pronto
- ✅ Com security rules ativas

## 🧪 Testar

### 1. Criar conta
- Email: seu@email.com
- Senha: SenhaForte123!

### 2. Criar cartão
- Número: 1234 5678 9012 3456
- Nome: SEU NOME
- Limite: 5000
- Saldo: 0

### 3. Adicionar transação
- Descrição: Teste
- Valor: 100
- Tipo: Expense
- Data: Hoje

### 4. Testar parcelamento
- Descrição: Notebook
- Valor: 3000
- Parcelas: 3
- Tipo: Expense

## 🐛 Troubleshooting

### Erro: "credentials not found"
```
❌ .env.local não está preenchido
✅ Verifique se tem 6 variáveis do Firebase
```

### Erro: "Permission denied"
```
❌ firestore.rules não foi importado
✅ Copie/cole as rules no Firebase Console
```

### Erro: "User not authenticated"
```
❌ Firebase Authentication não está habilitado
✅ Vá para Authentication → Sign-in method → Email/Password
```

### Transações não aparecem
```
❌ Verifique se o Firestore database foi criado
✅ Ele deve estar em modo Produção, não Testing
```

## 📚 Próximos Passos

1. **Integrar com seu Dashboard**
   - Leia: `PROJECT_STRUCTURE.md`
   - Substitua LocalStorage por Firestore

2. **Adicionar mais features**
   - Filtros avançados
   - Gráficos em tempo real
   - Relatórios mensais

3. **Deploy em produção**
   - `npm run build`
   - Deploy para Firebase Hosting ou Vercel

4. **Monitorar performance**
   - Usar Firebase Analytics
   - Otimizar queries do Firestore

## ✨ Tips & Tricks

### Debugar Firestore
```javascript
import { getFirestore, collection, getDocs } from 'firebase/firestore'

const querySnapshot = await getDocs(collection(db, 'users'))
console.log('Usuários:', querySnapshot.docs.map(d => d.data()))
```

### Listar todas as transações de um mês
```javascript
import { getTransactionsByDateRange } from '@/services/transactions'

const start = new Date(2024, 11, 1) // Dezembro
const end = new Date(2024, 11, 31)
const txns = await getTransactionsByDateRange(user.uid, start, end)
```

### Acompanhar mudanças em tempo real
```javascript
import { onSnapshot, collection } from 'firebase/firestore'

onSnapshot(collection(db, 'users', uid, 'transactions'), (snapshot) => {
  console.log('Transações atualizadas:', snapshot.docs.map(d => d.data()))
})
```

## 🎯 Agora é com você!

Você tem tudo que precisa. Qualquer dúvida, consulte:
- `FIREBASE_SETUP.md` - Guia detalhado
- `PROJECT_STRUCTURE.md` - Arquitetura
- `GUIA_FIREBASE.md` - Referência rápida

**Bom desenvolvimento! 🚀**

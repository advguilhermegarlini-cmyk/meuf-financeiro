# Guia Completo de Integração Firebase - Meu Financeiro

## Visão Geral

Este aplicativo agora está **totalmente integrado ao Firebase**:
- ✅ Autenticação via Firebase Auth (email/senha)
- ✅ Banco de dados Firestore (sem localStorage)
- ✅ Sincronização em tempo real entre dispositivos
- ✅ Regras de segurança (cada usuário só vê seus dados)
- ✅ Hospedagem no Firebase Hosting

---

## 📋 Estrutura do Banco de Dados

### Coleção: `users` (Perfil do usuário)
```
users/
  └─ {uid}
      ├─ email: string
      ├─ displayName: string
      ├─ name: string
      ├─ createdAt: timestamp
      └─ updatedAt: timestamp
```

### Subcoleções por usuário:

#### `users/{uid}/transactions` (Transações)
```
{
  id: string (gerado automaticamente),
  description: string,
  amount: number,
  type: "income" | "expense" | "transfer",
  date: timestamp,
  categoryId: string,
  bankId: string,
  isCreditCard: boolean,
  isReconciled: boolean,
  notes: string (opcional),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `users/{uid}/cards` (Cartões de crédito)
```
{
  id: string,
  name: string,
  number: string,
  balance: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `users/{uid}/categories` (Categorias)
```
{
  id: string,
  name: string,
  type: "income" | "expense",
  color: string (hex),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `users/{uid}/banks` (Bancos/Contas)
```
{
  id: string,
  name: string,
  type: "checking" | "savings" | "credit",
  balance: number,
  creditCardClosingDay: number (opcional),
  creditCardDueDay: number (opcional),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `users/{uid}/investments` (Investimentos)
```
{
  id: string,
  name: string,
  principal: number,
  rate: number,
  frequency: "daily" | "monthly" | "yearly",
  bankId: string,
  startDate: timestamp (opcional),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## 🔧 Passos para Configurar no Firebase Console

### 1. **Acessar o Firebase Console**
- Vá para https://console.firebase.google.com/
- Selecione seu projeto: **meu-financeiro-331e4**

### 2. **Verificar Autenticação (Firebase Auth)**

**Passo 2.1:** No menu esquerdo, clique em **Authentication**
```
Authentication → Usuários → verificar emails cadastrados
```

**Status esperado:** ✅ Você deve ver usuários cadastrados com email/senha

---

### 3. **Verificar Firestore Database**

**Passo 3.1:** No menu esquerdo, clique em **Firestore Database**

**Passo 3.2:** Você deve ver a estrutura:
```
meu-financeiro-331e4 (Cloud Firestore)
└─ users (coleção)
    └─ {uid do seu usuário}
        ├─ transactions (subcoleção)
        ├─ categories (subcoleção)
        ├─ banks (subcoleção)
        ├─ investments (subcoleção)
        └─ cards (subcoleção)
```

**Como verificar seus dados:**
1. Clique em **Firestore Database** → **Data**
2. Selecione a coleção `users`
3. Clique no UID do seu usuário
4. Clique em cada subcoleção para ver os dados

---

### 4. **Atualizar Regras de Segurança**

**Passo 4.1:** No menu esquerdo, clique em **Firestore Database** → **Rules**

**Passo 4.2:** Copie e cole o conteúdo do arquivo `firestore.rules` do seu projeto

O arquivo contém:
- ✅ Validação de tipos de dados
- ✅ Proteção: cada usuário só pode acessar seus próprios dados
- ✅ Suporte para: transactions, categories, banks, investments, cards

**Passo 4.3:** Clique em **Publish** para ativar as regras

---

### 5. **Verificar Hosting**

**Passo 5.1:** No menu esquerdo, clique em **Hosting**

**Passo 5.2:** Você verá:
```
App url: https://meu-financeiro-331e4.web.app
```

**Status:** ✅ Site está hospedado e atualizado

---

## 📱 Testar Sincronização Entre Dispositivos

### Teste 1: Login em dois navegadores
```
1. Abra o app em um navegador
   → Login com seu email
   → Crie uma transação
   
2. Em outro navegador/aba
   → Abra o app (sem fazer login, a sessão pode estar ativa via Firebase)
   → Vá para "Transações"
   → Verifique se a transação aparece
   
✅ Se aparecer = sincronização funcionando!
```

### Teste 2: Login em dois dispositivos (celular + desktop)
```
1. Desktop: https://meu-financeiro-331e4.web.app
   → Login com seu email
   
2. Celular: https://meu-financeiro-331e4.web.app
   → Login com o mesmo email (sessão persistente via Firebase Auth)
   → Crie uma categoria no celular
   
3. Desktop: Recarregue a página (F5)
   → A categoria deve aparecer automaticamente
   
✅ Se aparecer = sincronização entre dispositivos OK!
```

---

## 🔒 Regras de Segurança Explicadas

### Regra: Cada usuário só vê seus dados
```
match /users/{uid} {
  // Apenas o próprio usuário pode ler seus dados
  allow read: if request.auth.uid == uid;
  
  // Apenas o próprio usuário pode criar/atualizar/deletar
  allow write: if request.auth.uid == uid;
}
```

### Validações de Dados
```
// Transação válida deve ter:
- description (string, obrigatória)
- amount (número > 0)
- type ("income", "expense", ou "transfer")
- date (timestamp ou string ISO)

// Se algum campo está faltando ou com tipo errado
// → Firestore rejeita a escrita automaticamente
```

---

## 🚨 Troubleshooting

### Problema 1: "Dados não aparecem no Firestore"
```
✅ Solução:
1. Verifique se você fez login com Firebase Auth (não localStorage)
2. No console do navegador, procure por erros
3. Vá em DevTools → Network → veja requisições Firestore
4. Verifique se a regra de segurança permite read/write
```

### Problema 2: "Erro: 'permission-denied' ao salvar dados"
```
✅ Solução:
1. Verifique se você está autenticado
2. Verifique se o UID no localStorage bate com Firebase Auth
3. Atualize as firestore.rules (Passo 4 acima)
4. Aguarde ~1 minuto para as regras propagarem
```

### Problema 3: "Dados aparecem no navegador A, mas não no B"
```
✅ Solução:
1. Limpe cache e localStorage do navegador B
   - DevTools → Application → Clear site data
2. Recarregue a página
3. Faça login novamente
4. Aguarde ~5 segundos para sincronizar
```

### Problema 4: "Sessão expirou ao abrir em outro dispositivo"
```
✅ Solução:
1. Isso é normal. Firebase Auth mantém sessão por:
   - browserLocalPersistence (padrão)
   - No mesmo navegador/dispositivo
2. Se abrir em novo dispositivo = fazer login novamente
3. Após login, todos os dados são carregados automaticamente
```

---

## 📊 Monitorar Uso no Firebase

### Ver Quota de Uso
```
1. Console Firebase → Visão Geral
2. Você verá:
   - Leituras Firestore (read operations)
   - Escritas Firestore (write operations)
   - Conexões de hospedagem
```

### Plano de Preços (Free Tier)
```
Firestore:
- 50.000 leituras/dia ✅
- 20.000 escritas/dia ✅
- 20.000 deletes/dia ✅

Hospedagem:
- 1GB de tráfego/mês ✅

👉 Mais que suficiente para app pessoal!
```

---

## 🔄 Fluxo de Dados (Resumido)

```
Aplicação (React)
    ↓
Firebase Auth (verificar identidade)
    ↓
Firestore Database (salvar dados)
    ↓
Firestore Rules (validar segurança)
    ↓
✅ Dados salvos e sincronizados para todos os seus dispositivos
```

---

## 📝 Próximos Passos (Opcional)

### 1. Criar Backups
```
Firestore → Importar/Exportar
→ Exportar dados regularmente para segurança
```

### 2. Configurar Notificações
```
Firebase Cloud Messaging (FCM)
→ Enviar alertas de transações para celular
```

### 3. Melhorias de Performance
```
Adicionar índices compostos:
- users/{uid}/transactions (ordenado por date, type)
- users/{uid}/categories (ordenado por type)
→ Queries ficarão mais rápidas
```

### 4. Integração com APIs
```
Exemplo: Integrar com Open Banking para:
- Sincronizar extratos bancários automaticamente
- Validar transações em tempo real
```

---

## 🆘 Contato / Dúvidas

Se tiver dúvidas sobre:
- **Firestore:** https://firebase.google.com/docs/firestore
- **Firebase Auth:** https://firebase.google.com/docs/auth
- **Cloud Functions:** Para automações avançadas

---

**Última atualização:** 6 de Dezembro de 2025
**Status:** ✅ Integração completa com Firebase

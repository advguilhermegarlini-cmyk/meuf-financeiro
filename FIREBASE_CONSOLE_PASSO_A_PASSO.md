# 📱 PASSO A PASSO FIREBASE CONSOLE - COM PRINTS

## 🔐 PASSO 1: ACESSAR FIREBASE

### Acesse:
```
https://console.firebase.google.com/
```

**O que você verá:**
- Lista de projetos
- Procure por: `meu-financeiro-331e4`
- Clique nele

---

## 📊 PASSO 2: VERIFICAR FIRESTORE DATABASE

### Após entrar no projeto:

```
Menu esquerdo → Firestore Database
↓
Você verá uma tela com collections
```

**O que procurar:**
- Deve ter uma collection chamada: `users`
- Dentro, um documento com seu UID (começa com números/letras)
- Dentro dele, deve haver:
  - ✅ `categories` (subcoleção)
  - ✅ `banks` (subcoleção)
  - ✅ `transactions` ← **AQUI DEVEM ESTAR SUAS TRANSAÇÕES!**

---

## 🔍 PASSO 3: PROCURAR SUAS TRANSAÇÕES

### Clique em:
```
users → seu-UID → transactions
```

**Se está VAZIO:**
❌ Suas transações NÃO estão sendo salvas!

**Se tem transações:**
✅ Estão sendo salvas corretamente!

---

## 📋 PASSO 4: VERIFICAR FIRESTORE RULES

### Clique em:
```
Firestore Database → Aba "Rules" (no topo)
```

**Você verá o arquivo firestore.rules**

### Procure pela seção de transactions:

```firestore
match /transactions/{transactionId} {
  allow read: if request.auth != null && isOwner(uid);
  allow create: if request.auth != null && isOwner(uid);
  allow update: if request.auth != null && isOwner(uid);
  allow delete: if request.auth != null && isOwner(uid);
}
```

**Se está diferente:**
1. Copie o código correto de `CODIGO_CORRIGIDO_FIREBASE.md`
2. Cole aqui
3. Clique "Publish" (botão azul)
4. Aguarde mensagem: ✅ "Rules updated successfully"

---

## 🧪 PASSO 5: TESTAR RULES (OPCIONAL)

### No editor de Rules, clique em:
```
"Test Rules" botão azul →
```

**Aparecerá um formulário:**

| Campo | Valor |
|-------|-------|
| Operation | Selecione: `create` |
| Path | Digite: `users/SEU-UID/transactions/test-doc` |
| Request data | Cole: `{"description": "Teste", "amount": 100, "type": "expense", "date": "2025-12-06T00:00:00Z"}` |

**Clique "Simulate"**

**Resultado esperado:**
```
✅ Permitido (verde)
```

Se aparecer vermelho com "Denied":
- Rules está bloqueando!
- Publique as rules corretas!

---

## 🔑 PASSO 6: ENCONTRAR SEU UID

### Você precisa saber seu UID para verificar dados

### Opção A: No Firebase Console
```
Menu esquerdo → Authentication
↓
Clique na aba "Users"
↓
Copie o UID do seu usuário (aparece no final de cada linha)
```

### Opção B: No Console do Navegador (F12)
```
1. Abra a app em https://meu-financeiro-331e4.web.app
2. Faça login
3. Abra DevTools: F12
4. Abra Console
5. Cole isto:
```

```javascript
import { getAuth } from 'firebase/auth';
const auth = getAuth();
console.log('Seu UID:', auth.currentUser.uid);
```

---

## 📲 PASSO 7: MONITORAR TRANSAÇÕES EM TEMPO REAL

### Volte para Firestore → users → seu-UID → transactions

**Deixe aberto enquanto:**
1. Você cria uma transação na app
2. A transação deve aparecer AQUI em tempo real!

**Se NÃO aparecer:**
- Abra DevTools (F12) da app
- Procure por logs de erro
- Compartilhe comigo os erros

---

## 🔐 PASSO 8: VERIFICAR PERMISSÕES

### Se aparecer erro "Permission Denied":

**No Firebase Console:**
```
Firestore Database → Rules
↓
Verifique se existe a função:
```

```firestore
function isOwner(uid) {
  return request.auth.uid == uid;
}
```

**Se não existe:**
1. Copie firestore.rules completo de `CODIGO_CORRIGIDO_FIREBASE.md`
2. Cole no editor
3. Clique "Publish"

---

## 🚀 PASSO 9: PUBLICAR MUDANÇAS

### Se você fez qualquer alteração nos Rules:

```
Clique no botão azul "Publish"
↓
Aguarde a mensagem de sucesso
↓
✅ "Successfully published rules"
```

**IMPORTANTE:** Não esqueça de fazer isso!

---

## 📊 PASSO 10: VERIFICAR STATUS GERAL

### Para ver o status de sua base de dados:

```
Menu esquerdo → Firestore Database
↓
Clique em "Data"
↓
Você verá:
  - Total de documentos
  - Tamanho da base
  - Estatísticas
```

---

## 🎯 CHECKLIST - FIREBASE CONSOLE

- [ ] Acessei https://console.firebase.google.com/
- [ ] Selecionei projeto `meu-financeiro-331e4`
- [ ] Acessei Firestore Database
- [ ] Verifiquei `users → seu-uid → transactions`
- [ ] Vi que está vazio OU tem minhas transações
- [ ] Verifiquei Rules estão corretas
- [ ] Testei Rules (opcional)
- [ ] Encontrei meu UID
- [ ] Publiquei Rules se necessário
- [ ] Anotei meu UID para referência

---

## 🆘 PROBLEMAS COMUNS

### "Não consigo encontrar meu UID"
→ Siga **PASSO 6** acima (busque em Authentication)

### "Rules está com erro ao publicar"
→ Volte e copie firestore.rules inteiro de `CODIGO_CORRIGIDO_FIREBASE.md`

### "Não aparecem transações em transactions"
→ Isso é o PROBLEMA que estamos resolvendo!

### "Vejo transações mas desaparecem ao recarregar"
→ Implemente código de `CODIGO_CORRIGIDO_FIREBASE.md`

---

## 📸 PRINTS ESPERADOS

### ✅ SE ESTÁ CORRETO:

**Firestore Database:**
```
users/
  57A5Zgtj03b4qQNB19FafXer0vz1/
    categories/ [5 docs]
    banks/ [3 docs]
    transactions/ [45 docs]  ← Suas transações aqui!
    cards/ [2 docs]
```

### ❌ SE ESTÁ ERRADO:

**Firestore Database:**
```
users/
  57A5Zgtj03b4qQNB19FafXer0vz1/
    categories/ [5 docs]
    banks/ [3 docs]
    transactions/ [VAZIO]  ← Problema!
    cards/ [2 docs]
```

---

## 🎉 CONCLUSÃO

Após completar este passo a passo:

1. ✅ Você conhece a estrutura do Firestore
2. ✅ Sabe onde estão seus dados
3. ✅ Pode verificar se transações estão sendo salvas
4. ✅ Sabe como testar e publicar Rules
5. ✅ Pode diagnosticar problemas

**Próximo passo:** Abra `INTEGRACAO_FIREBASE_COMPLETA.md` seção "TESTE 2" para criar uma transação e verificar se aparece aqui!

---

**Última atualização:** 2025-12-06  
**Versão:** Firebase Console Guide v1.0

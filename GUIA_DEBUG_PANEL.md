# 🔍 DEBUG PANEL - Guia Rápido

## ✅ Instalação Completa

O DebugPanel já foi adicionado automaticamente ao `App.tsx`. Só precisa rodar o projeto:

```bash
npm run dev
```

## 🎯 Como Usar

### 1️⃣ **Abrir Debug Panel**
- Procure o botão **verde com símbolo de terminal** no canto inferior direito
- Clique para abrir

### 2️⃣ **Informações Exibidas**

| Campo | O que significa |
|-------|-----------------|
| **USER ID** | ID único do seu usuário (deve ser IGUAL em WiFi e Celular) |
| **EMAIL** | Email da conta |
| **NAME** | Nome do usuário |
| **BANKS/CARDS** | Quantidade de cartões/bancos criados |

### 3️⃣ **Botões Disponíveis**

| Botão | Função |
|-------|--------|
| **Log Console** | Abre o console do navegador (F12) e mostra dados detalhados |
| **Recarregar** | Recarrega a página para testar persistência |

---

## 🚀 Teste Prático - Passo a Passo

### **WiFi: Criar Cartão**
```
1. Login com email: seu@email.com
2. Clique no DebugPanel (verde)
3. Anote o USER ID (ex: abc123def456)
4. Crie um novo cartão (ex: Visa)
5. Veja o contador: BANKS/CARDS: 1
```

### **Celular 3G: Verificar Dados**
```
1. Acesse em 3G com MESMO email: seu@email.com
2. Clique no DebugPanel (verde)
3. Anote o USER ID
4. Verifique o contador BANKS/CARDS

RESULTADO ESPERADO:
✅ USER ID: abc123def456 (IGUAL ao WiFi)
✅ BANKS/CARDS: 1 (Mesmo cartão aparece!)

RESULTADO COM PROBLEMA:
❌ USER ID: xyz789ghi012 (DIFERENTE!)
❌ BANKS/CARDS: 0 (Não aparece o cartão)
```

---

## 🔧 Se Encontrar um Problema

### **Problema 1: UIDs Diferentes**

**Sintoma:**
```
WiFi UID: abc123def456
Celular UID: xyz789ghi012 ❌ DIFERENTE
```

**Causa:** Você criou 2 contas diferentes

**Solução:**
1. Abra Firebase Console
2. Vá em: Authentication → Users
3. Delete a conta do WiFi e do Celular
4. Crie uma única conta
5. Use em ambos os dispositivos

---

### **Problema 2: UIDs Iguais mas Sem Dados**

**Sintoma:**
```
WiFi UID: abc123def456
WiFi BANKS: 1 ✓

Celular UID: abc123def456 ✓
Celular BANKS: 0 ❌
```

**Causa:** Firestore Rules bloqueando acesso

**Solução:**
1. Abra Firebase Console
2. Vá em: Firestore Database → Rules
3. Clique em **Edit Rules**
4. Cole isso:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
      
      match /{document=**} {
        allow read, write: if request.auth.uid == uid;
      }
    }
  }
}
```
5. Clique **Publish**

---

### **Problema 3: Sem Erros mas Carrega Lentamente**

**Sintoma:**
```
Celular 3G:
⟳ Carregando...  (fica muito tempo assim)
```

**Causa:** Timeout na conexão 3G

**Solução:** Aguarde mais tempo ou use WiFi para testar

---

## 📱 Teste Completo em 1 Minuto

**No WiFi:**
```
npm run dev
→ Abra em localhost:5173
→ Crie uma conta
→ Abra DebugPanel
→ Copie o USER ID
→ Crie um cartão
```

**No Celular (3G):**
```
→ Abra o mesmo localhost:5173 no celular
→ Faça login com o MESMO email
→ Abra DebugPanel
→ Compare USER ID
→ Veja se o cartão aparece
```

**Se tudo está igual e o cartão aparece:** ✅ **PROBLEMA RESOLVIDO!**

**Se não aparece:** Siga os passos acima para resolver

---

## 💡 Dicas Pro

### **Ver Dados em Tempo Real**
1. Clique em **Log Console**
2. Abra DevTools (F12)
3. Veja todos os dados no console

### **Testar com Remote DevTools (Android)**
1. No Android: Ative "Opções do Desenvolvedor"
2. No PC: Digite `chrome://inspect`
3. Conecte o celular via USB
4. Veja logs em tempo real do celular

### **Limpar Cache**
Se algo ficar estranho:
1. No DebugPanel, clique **Recarregar**
2. Ou: Ctrl+Shift+Delete para limpar cache do navegador

---

## ✅ Checklist Final

- [ ] DebugPanel está visível (botão verde no canto)?
- [ ] USER ID é IGUAL em WiFi e Celular?
- [ ] BANKS/CARDS mostra a mesma quantidade?
- [ ] Nenhum erro "permission-denied"?
- [ ] Dados aparecem em menos de 10 segundos?

Se todos os ✓, seu app está funcionando perfeitamente em WiFi e 3G! 🎉

---

**Próxima ação:** Execute o teste e me diga os resultados!

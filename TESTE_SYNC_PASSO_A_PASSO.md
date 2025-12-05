# Como Debugar: Dados não sincronizam entre WiFi e Celular 3G

## Passo 1: Ativar Debug Panel

Abra `App.tsx` e adicione no topo:

```jsx
import DebugPanel from '@/components/DebugPanel'

export default function App() {
  return (
    <>
      {/* Seu código aqui */}
      <DebugPanel />
    </>
  )
}
```

Depois execute: `npm run dev`

## Passo 2: Teste em WiFi

1. **Abra a página no WiFi**
2. **Clique no botão "Abrir Debug"** (verde no canto inferior direito)
3. **Anote:**
   - UID: ________________
   - Email: ________________
   - Cartões: ______ (quantos tem?)

4. **Crie um novo cartão**
5. **Clique em "Log No Console"** e abra o DevTools (F12)
6. **Procure por:**
   ```
   User: {...}
   UserData: {...}
   Cards: [{...}]
   ```

## Passo 3: Teste no Celular 3G

1. **Abra a página no celular com 3G**
2. **Digite o MESMO email que usou no WiFi**
3. **Faça login**
4. **Clique em "Abrir Debug"** (verde no canto)
5. **Anote:**
   - UID: ________________
   - Email: ________________
   - Cartões: ______ (quantos tem?)

## Passo 4: Compare

### Resultado Esperado ✅
```
WiFi:
  UID: abc123def456
  Email: seu@email.com
  Cartões: 1

Celular:
  UID: abc123def456  (IGUAL!)
  Email: seu@email.com (IGUAL!)
  Cartões: 1  (IGUAL!)
```

### Resultado com Problema ❌ (Mais Comum)
```
WiFi:
  UID: abc123def456
  Email: seu@email.com
  Cartões: 1

Celular:
  UID: abc123def456  (OK, igual)
  Email: seu@email.com (OK, igual)
  Cartões: 0  (PROBLEMA! Nao carrega)
  
  ERRO: "permission-denied" ou "not-found"
```

## Se o Problema For: UIDs Diferentes

```
WiFi:
  UID: abc123def456

Celular:
  UID: xyz789ghi012  (DIFERENTE!)
```

**Causa:** Você criou 2 contas diferentes!

**Solução:**
1. No WiFi: Logout
2. No WiFi: Delete a conta (Firebase Console)
3. No Celular: Delete a conta (Firebase Console)
4. No WiFi: Crie uma nova conta
5. No Celular: Faça login com o MESMO email

---

## Se o Problema For: UIDs Iguais mas Sem Cartões

```
WiFi:
  UID: abc123def456
  Cartões: 1

Celular:
  UID: abc123def456  (OK!)
  Cartões: 0  (PROBLEMA!)
  ERRO: permission-denied
```

**Causa:** Firestore Security Rules bloqueando

**Solução:**
1. Abra Firebase Console
2. Vá em: Firestore Database → Rules
3. Cole isso:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permite usuário acessar seus próprios dados
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
      
      match /cards/{cardId} {
        allow read, write: if request.auth.uid == uid;
      }
      
      match /transactions/{transactionId} {
        allow read, write: if request.auth.uid == uid;
      }
    }
    
    // Bloqueia tudo mais
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```
4. Clique em "Publish"
5. Recarregue no celular

---

## Se o Problema For: Nenhum Erro, Mas Não Carrega

```
Celular:
  UID: abc123def456  (OK!)
  Email: seu@email.com (OK!)
  Cartões: 0 ou "Nao carregado"
  Sem erros
```

**Causa:** Timeout na conexão 3G

**Solução:**

A. Aumentar timeout em `src/services/cards.js`:

Procure por:
```javascript
export const getCardsByUserId = async (uid) => {
```

Adicione timeout:
```javascript
export const getCardsByUserId = async (uid) => {
  try {
    const cardsRef = getCardsCollection(uid);
    const q = query(cardsRef, orderBy('createdAt', 'desc'));
    
    // Adiciona timeout de 30 segundos
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 30000)
    );
    
    const snapshot = await Promise.race([
      getDocs(q),
      timeoutPromise
    ]);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Erro ao obter cartões:', error);
    throw error;
  }
};
```

B. Ou ativar cache persistente no Firebase:

Adicione em `src/firebase.js`:
```javascript
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const db = initializeFirestore(app, {
  localCache: persistentLocalCache(
    persistentMultipleTabManager()
  )
});
```

---

## Checklist de Diagnóstico

- [ ] UID é IGUAL em WiFi e Celular?
  - Se NÃO: Você criou 2 contas diferentes
  
- [ ] Cartões aparecem no Celular?
  - Se NÃO: Cheque próximas perguntas
  
- [ ] Tem erro "permission-denied"?
  - Se SIM: Firestore.rules precisa atualizar
  
- [ ] Tem erro "not-found"?
  - Se SIM: Cartão não foi salvo no WiFi
  
- [ ] Sem erro mas não carrega?
  - Se SIM: Timeout na conexão 3G

---

## Próxima Ação

Rode o teste acima e me diga:

1. **UID é igual em WiFi e Celular?** (SIM / NAO)
2. **Qual é o erro no celular?** (ERRO _____)
3. **Debug Panel mostra quantos cartões no celular?** (NUMERO)

Com isso poderei identificar exatamente qual é o problema!

---

**Dica:** Se tiver Android, você pode usar Chrome DevTools remotamente:
1. No celular: Ative "Opções do Desenvolvedor"
2. No PC: `chrome://inspect`
3. Selecione seu celular
4. Veja os logs em tempo real

Isso vai te mostrar exatamente o que está acontecendo!

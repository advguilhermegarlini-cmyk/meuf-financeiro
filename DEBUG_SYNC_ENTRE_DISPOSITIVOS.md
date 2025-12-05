# DEBUG: Problema de Sincronização entre Dispositivos

## Entendendo o Problema

Quando você:
1. Loga no WiFi com email@example.com
2. Cria um cartão (aparece na tela)
3. Loga no celular 3G com MESMO email@example.com
4. Resultado: Cartão NÃO aparece

## Possíveis Causas

### Causa 1: Email diferente em cada dispositivo
- **Sintoma**: Diz que está logado mas dados diferentes
- **Solução**: Verify que está usando EXATAMENTE o mesmo email

### Causa 2: UID diferente
- **Sintoma**: Firebase cria UID diferente para cada email
- **Solução**: Verifique que o UID é o mesmo

### Causa 3: Firestore não salvando
- **Sintoma**: Dados desaparecem após recarregar
- **Solução**: Verifique se está em modo Test (permite) ou Produção

### Causa 4: Security Rules bloqueando
- **Sintoma**: Sem erro, mas dados não aparecem
- **Solução**: Verifique firestore.rules

## Como Debugar

### Passo 1: Verificar UID no Console

Adicione este código temporariamente no seu App.tsx:

```jsx
import { useAuth } from '@/hooks/useAuth'

export function DebugInfo() {
  const { user, userData } = useAuth()
  
  return (
    <div style={{ position: 'fixed', bottom: 0, right: 0, background: '#000', 
                   color: '#0f0', padding: '10px', fontSize: '12px', maxWidth: '300px', 
                   zIndex: 999, fontFamily: 'monospace' }}>
      <p>UID: {user?.uid}</p>
      <p>Email: {user?.email}</p>
      <p>Dados: {JSON.stringify(userData, null, 2)}</p>
      <button onClick={() => console.log('User:', user, 'Data:', userData)}>
        Log Console
      </button>
    </div>
  )
}

// No App.tsx
<DebugInfo />
```

**Teste em AMBOS os dispositivos:**
1. WiFi: Qual é o UID?
2. Celular 3G: Qual é o UID?
3. SÃO IGUAIS? Se não, problema está aqui!

### Passo 2: Verificar se Cartão Salva no Firestore

1. Abra Firebase Console
2. Vá em: Firestore Database
3. Procure por: `users` → seu UID → `cards`
4. Deveria ter um documento com seus dados

**Se não tiver:**
- Dados não estão sendo salvos
- Problema em `createCard()`

**Se tiver:**
- Dados estão lá
- Problema em `getCardsByUserId()` ou permissões

### Passo 3: Testar Leitura de Cartões

Adicione este código no componente que lista cartões:

```jsx
import { useAuth } from '@/hooks/useAuth'
import { getCardsByUserId } from '@/services/cards'
import { useEffect, useState } from 'react'

export function CardDebug() {
  const { user } = useAuth()
  const [cards, setCards] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user?.uid) return
    
    getCardsByUserId(user.uid)
      .then(cardsData => {
        console.log('Cartões carregados:', cardsData)
        setCards(cardsData)
      })
      .catch(err => {
        console.error('Erro ao carregar cartões:', err)
        setError(err.message)
      })
  }, [user?.uid])

  return (
    <div>
      <p>UID: {user?.uid}</p>
      <p>Total: {cards.length} cartões</p>
      {error && <p style={{ color: 'red' }}>Erro: {error}</p>}
      {cards.map(c => (
        <div key={c.id}>
          {c.cardName} - {c.number}
        </div>
      ))}
    </div>
  )
}
```

### Passo 4: Verificar Permissões no Firestore

Seus firestore.rules devem ter:

```javascript
match /users/{uid} {
  allow read, write: if request.auth.uid == uid;
  
  match /cards/{cardId} {
    allow read, write: if request.auth.uid == uid;
  }
}
```

**Se tiver algo diferente, cartões podem não sincronizar!**

## Roteiro de Teste Completo

### Teste 1: Mesmo Dispositivo, Recarregar
```
1. WiFi: Loga com email@example.com
2. WiFi: Cria cartão "Visa"
3. WiFi: Cartão aparece? (Esperado: SIM)
4. WiFi: Recarrega página (F5)
5. WiFi: Cartão ainda aparece? (Esperado: SIM)
   - Se NÃO: Problema em GET/READ
   - Se SIM: Continuar
```

### Teste 2: Mesmo Dispositivo, Logout/Login
```
1. WiFi: Loga com email@example.com
2. WiFi: Cria cartão "Visa"
3. WiFi: Logout
4. WiFi: Login com MESMO email@example.com
5. WiFi: Cartão aparece? (Esperado: SIM)
   - Se NÃO: Problema em getUserById/loadData
   - Se SIM: Continuar
```

### Teste 3: Outro Dispositivo, Email Diferente
```
1. WiFi: Loga com alice@example.com
2. WiFi: Cria cartão "Visa"
3. Celular: Loga com bob@example.com
4. Celular: Cartão aparece? (Esperado: NÃO)
   - Se SIM: BUG! Dados de outro usuário
   - Se NÃO: OK, esperado
```

### Teste 4: Outro Dispositivo, MESMO Email
```
1. WiFi: Loga com alice@example.com
2. WiFi: Cria cartão "Visa"
3. Celular: Loga com alice@example.com
4. Celular: Cartão aparece? (Esperado: SIM)
   - Se NÃO: ESTE É O PROBLEMA - UIDs diferentes?
   - Se SIM: FUNCIONA!
```

## O Que Procurar no Console

Abra DevTools (F12) e procure por erros:

```
❌ Erro: "permission-denied"
   → Firestore.rules bloqueando
   → SOLUÇÃO: Atualize rules

❌ Erro: "not-found"
   → Documento não existe no Firestore
   → SOLUÇÃO: Verifique se cartão foi salvo

❌ Erro: "deadline-exceeded"
   → Timeout na conexão
   → SOLUÇÃO: 3G é lento, aumentar timeout

✅ Sem erro
   → Verificar se dados estão nos logs
```

## Checklist de Verificação

- [ ] Email é EXATAMENTE o mesmo em WiFi e Celular?
- [ ] UID é EXATAMENTE o mesmo em WiFi e Celular?
- [ ] Cartão aparece em `/users/{uid}/cards` no Firebase Console?
- [ ] Firestore.rules tem `allow read` para subcollection?
- [ ] Sem erros de "permission-denied" no console?
- [ ] Sem erros de "not-found" no console?
- [ ] Teste de Logout/Login funciona no WiFi?

## Próxima Ação

Execute o **Teste 4** acima e me diga:
1. O que você vê em ambos os dispositivos?
2. Qual é o UID em WiFi?
3. Qual é o UID no Celular?
4. Tem erros no console?

---

**Isso vai identificar exatamente onde está o problema!**

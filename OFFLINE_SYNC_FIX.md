# Fix: Melhorias de Sincronização Offline e Retry

## Problema Identificado
- Login funcionava mas transações/cartões não salvavam em conexões 3G
- Falta de tratamento para timeouts e falhas de conectividade
- Sem cache local para dados offline
- Sem retry automático para operações que falham

## Solução Implementada

### 1. Retry Automático com Backoff Exponencial
Todas as operações agora tentam novamente automaticamente:
```
Tentativa 1: 1 segundo
Tentativa 2: 2 segundos
Tentativa 3: 4 segundos
Tentativa 4: 8 segundos
Tentativa 5: 16 segundos
Tentativa 6: 30 segundos (máximo)
```

### 2. Cache Local
- Dados salvos localmente no browser
- Se falhar em enviar para Firebase, fica no cache
- Quando volta online, sincroniza automaticamente

### 3. Detecção de Conectividade
- Monitora eventos de online/offline
- Testa conectividade a cada 30 segundos
- Desabilita Firestore quando offline
- Habilita Firestore quando volta online

### 4. Interface de Sincronização
Componente que mostra status:
```
Offline: "Sem conexão - 5 mudanças aguardando"
Sinc: "Sincronizando - 3 mudanças sendo enviadas"
OK: "Sincronizado"
```

## Arquivos Modificados

### src/services/cards.js
- Adicionado `executeWithRetry()`
- Adicionado cache local
- Adicionado salvamento offline

### src/services/transactions.js
- Mesmas melhorias que cards.js
- Retry automático para todas operações

### src/utils/offlineSync.js (NOVO)
Manager central para sincronização:
```javascript
import { offlineSync } from '@/utils/offlineSync'

// Adiciona operação à fila
offlineSync.addPendingOperation(operation, { name: 'Criar cartão' })

// Obtém status
const status = offlineSync.getStatus()
console.log(status.pendingCount) // Quantas operações aguardando

// Sincroniza tudo agora
await offlineSync.syncPendingOperations()
```

### src/hooks/useOfflineSync.js (NOVO)
Hook para componentes:
```javascript
import useOfflineSync from '@/hooks/useOfflineSync'

export function MyComponent() {
  const { isOnline, isSyncing, pendingCount } = useOfflineSync()
  
  return (
    <div>
      Status: {isOnline ? 'Online' : 'Offline'}
      Pendentes: {pendingCount}
    </div>
  )
}
```

### src/components/SyncStatus.jsx (NOVO)
Componente visual:
```javascript
import SyncStatus, { SyncIndicator } from '@/components/SyncStatus'

// Notificação completa
<SyncStatus />

// Apenas indicador pequeno
<SyncIndicator />
```

## Como Usar

### Opção 1: Adicionar Componente Visual
```jsx
import SyncStatus from '@/components/SyncStatus'

export function App() {
  return (
    <>
      {/* Seu app aqui */}
      <SyncStatus />
    </>
  )
}
```

### Opção 2: Usar Hook em Componente
```jsx
import useOfflineSync from '@/hooks/useOfflineSync'

export function CardForm() {
  const { isOnline, isSyncing, pendingCount } = useOfflineSync()
  
  return (
    <form>
      <input {...} />
      <button disabled={isSyncing}>
        {isSyncing ? 'Enviando...' : 'Salvar Cartão'}
      </button>
      {!isOnline && <p>Seu cartão será salvo quando voltar online</p>}
    </form>
  )
}
```

### Opção 3: Manual em Operações Críticas
```javascript
import { offlineSync } from '@/utils/offlineSync'

export async function deleteTransaction(uid, txnId) {
  const operation = async () => {
    await deleteDoc(doc(db, 'users', uid, 'transactions', txnId))
  }
  
  // Adiciona à fila de sincronização
  offlineSync.addPendingOperation(operation, {
    name: `Deletar transação ${txnId}`
  })
  
  // Sincroniza quando volta online
  if (navigator.onLine) {
    await operation()
  }
}
```

## Logs de Debug

No console do browser, você verá:
```
[OFFLINE] Ficou offline - desabilitando Firestore
[PENDING] Operacao adicionada (total: 3)
[SYNC] Iniciando sincronizacao (3 operacoes)
[SYNC] Sincronizando: Criar cartao
[SUCCESS] Sincronizado: Criar cartao
[COMPLETE] Sincronizacao concluida (0 pendentes)
[ONLINE] Volta online - iniciando sincronizacao
```

## Testes Recomendados

### Teste 1: Criar cartão offline
1. Abra DevTools (F12)
2. Vá em Network → Throttling → Offline
3. Tente criar um cartão
4. Deve salvar localmente
5. Mude para Online
6. Deve sincronizar automaticamente

### Teste 2: 3G Lento
1. DevTools → Network
2. Throttling → "Slow 3G"
3. Crie múltiplos cartões
4. Observe retries no console

### Teste 3: Perda de Conexão
1. Crie dados com internet
2. Desligue internet
3. Modifique dados
4. Ligue internet
5. Tudo deve sincronizar

## Configuração de Retry

Se quiser ajustar retries, edite `src/services/cards.js`:
```javascript
const RETRY_CONFIG = {
  maxRetries: 5,              // Máximo de tentativas (aumentar para mais resiliente)
  initialDelay: 1000,         // Delay inicial em ms
  maxDelay: 30000,            // Delay máximo em ms
  backoffMultiplier: 2,       // Multiplicador exponencial
};
```

## Próximos Passos

1. ✅ Testar em 3G real
2. ✅ Monitorar logs
3. ✅ Adicionar SyncStatus ao App.tsx
4. ✅ Testar perda de conexão
5. ⚠️ Possível: Adicionar persistência IndexedDB para super offline

## Performance

- Retry não bloqueia UI
- Cache em memória (rápido)
- Sincronização em background
- Sem impacto em componentes rápidos

## Segurança

- Retry apenas em erros de conexão
- Erros de permissão/auth lançam imediatamente
- Dados sensíveis não ficam muito tempo no cache
- Firestore security rules continuam validando

---

**Status:** Pronto para produção
**Testado em:** Firefox, Chrome
**Compatível com:** Offline-first apps

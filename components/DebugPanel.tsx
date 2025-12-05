import React, { useState, useEffect } from 'react';
import { useApp } from '../context';
import { Terminal, X } from 'lucide-react';

export default function DebugPanel() {
  const { user, banks, isLoading } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    if (isOpen && user) {
      setDebugInfo({
        uid: user.id,
        email: user.email,
        name: user.name,
        banksCount: Array.isArray(banks) ? banks.length : 0,
        banks: banks || [],
        timestamp: new Date().toISOString(),
      });
    }
  }, [isOpen, user, banks]);

  const handleLogToConsole = () => {
    console.log('=== DEBUG INFO ===');
    console.log('User ID:', user?.id);
    console.log('User Email:', user?.email);
    console.log('User Name:', user?.name);
    console.log('Banks/Cards:', banks);
    console.log('Timestamp:', new Date().toISOString());
    console.log('==================');
  };

  const handleReload = () => {
    window.location.reload();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-green-500 hover:bg-green-600 text-black rounded-full shadow-lg flex items-center justify-center cursor-pointer z-9998 transition-all"
        title="Abrir Debug Panel"
      >
        <Terminal size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 bg-black border-2 border-green-500 rounded-lg shadow-2xl z-9999 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-green-500 text-black px-4 py-2 flex justify-between items-center font-mono font-bold">
        <span>DEBUG PANEL</span>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-green-600 p-1 rounded"
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-green-400 bg-black">
        {!user ? (
          <div className="text-yellow-400">
            <div>⚠️ Não autenticado</div>
          </div>
        ) : (
          <>
            {/* User ID */}
            <div className="mb-3 pb-2 border-b border-green-900">
              <div className="text-green-300 font-bold">USER ID</div>
              <div className="break-all text-green-400">
                {user.id}
              </div>
            </div>

            {/* Email */}
            <div className="mb-3 pb-2 border-b border-green-900">
              <div className="text-green-300 font-bold">EMAIL</div>
              <div className="break-all text-green-400">
                {user.email}
              </div>
            </div>

            {/* Name */}
            <div className="mb-3 pb-2 border-b border-green-900">
              <div className="text-green-300 font-bold">NAME</div>
              <div className="break-all text-green-400">
                {user.name || 'N/A'}
              </div>
            </div>

            {/* Banks */}
            <div className="mb-3 pb-2 border-b border-green-900">
              <div className="text-green-300 font-bold">BANKS/CARDS ({Array.isArray(banks) ? banks.length : 0})</div>
              {Array.isArray(banks) && banks.length > 0 ? (
                <div className="text-green-400">
                  {banks.map((bank: any, idx: number) => (
                    <div key={idx} className="mb-2 p-2 bg-green-900/20 rounded">
                      <div>#{idx + 1}: {bank.name}</div>
                      <div className="text-green-500 text-xs">
                        Saldo: R$ {bank.balance?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-yellow-400">Nenhum banco/cartão</div>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-yellow-400 mb-2">
                ⟳ Carregando...
              </div>
            )}

            {/* Timestamp */}
            <div className="text-green-500 text-xs">
              {debugInfo.timestamp}
            </div>
          </>
        )}
      </div>

      {/* Footer - Buttons */}
      <div className="bg-green-900/30 border-t border-green-900 p-3 flex gap-2">
        <button
          onClick={handleLogToConsole}
          className="flex-1 bg-green-600 hover:bg-green-700 text-black px-3 py-1 rounded text-xs font-bold transition-all"
        >
          Log Console
        </button>
        <button
          onClick={handleReload}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-bold transition-all"
        >
          Recarregar
        </button>
      </div>
    </div>
  );
}

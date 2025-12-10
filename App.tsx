
import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context';
import { Layout, Button } from './components/Layout';
import { FloatingActionButton } from './components/FloatingActionButton';
import { QuickTransactionModal } from './components/QuickTransactionModal';
import { Dashboard } from './components/Dashboard';
import { Transactions } from './components/Transactions';
import { CreditCardsModule, BanksModule, CategoriesModule, InvestmentsModule } from './components/FinanceModules';
import { FinancialHealthSettings } from './components/FinancialHealthSettings';
import { ShieldCheck, User as UserIcon, AlertTriangle, Camera, Lock, ArrowLeft, Key, Trash2, Activity, Download } from 'lucide-react';

interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex items-center justify-center bg-[#0d1117] text-white p-8 text-center">
            <div>
                <AlertTriangle size={48} className="mx-auto text-github-danger mb-4" />
                <h1 className="text-2xl font-bold mb-2">Algo deu errado.</h1>
                <p className="text-github-muted mb-4">Ocorreu um erro ao carregar o aplicativo.</p>
                <pre className="bg-black/30 p-4 rounded text-xs text-left overflow-auto max-w-lg mx-auto mb-4 border border-github-border">
                    {this.state.error?.toString()}
                </pre>
                <Button onClick={() => { localStorage.clear(); window.location.reload(); }} variant="danger">
                    Limpar Dados e Recarregar
                </Button>
            </div>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

const AuthScreen = () => {
  const { login, register, resetPassword } = useApp();
  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Used for forgot password reset
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
        if (view === 'login') {
            await login(email, password);
        } else if (view === 'register') {
            if (!name) throw new Error('Nome é obrigatório.');
            await register(name, email, password);
        } else if (view === 'forgot') {
            if(password !== confirmPassword) {
                 throw new Error('As senhas não coincidem.');
            }
            await resetPassword(email, password);
            setSuccess('Senha redefinida com sucesso! Você já pode fazer login.');
            setTimeout(() => setView('login'), 2000);
        }
    } catch (err: any) {
        setError(err.toString());
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#161b22] border border-[#30363d] rounded-xl p-8 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="bg-github-primary/20 p-4 rounded-full text-github-primary">
            <ShieldCheck size={48} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-white mb-2">Meu Financeiro</h1>
        <p className="text-center text-[#8b949e] mb-8">Gestão financeira pessoal simples e eficiente.</p>
        
        {view !== 'forgot' ? (
             <div className="flex border-b border-[#30363d] mb-6">
                <button 
                    className={`flex-1 pb-2 text-sm font-medium ${view === 'login' ? 'text-white border-b-2 border-github-primary' : 'text-[#8b949e] hover:text-white'}`}
                    onClick={() => setView('login')}
                >
                    Entrar
                </button>
                <button 
                    className={`flex-1 pb-2 text-sm font-medium ${view === 'register' ? 'text-white border-b-2 border-github-primary' : 'text-[#8b949e] hover:text-white'}`}
                    onClick={() => setView('register')}
                >
                    Cadastrar
                </button>
            </div>
        ) : (
            <div className="mb-6">
                 <button onClick={() => setView('login')} className="flex items-center text-sm text-[#8b949e] hover:text-white">
                     <ArrowLeft size={16} className="mr-1"/> Voltar ao Login
                 </button>
                 <h2 className="text-xl font-bold text-white mt-4">Redefinir Senha</h2>
            </div>
        )}
       

        {error && (
            <div className="bg-red-900/20 border border-red-900 text-red-200 text-sm p-3 rounded mb-4">
                {error}
            </div>
        )}
        
        {success && (
            <div className="bg-green-900/20 border border-green-900 text-green-200 text-sm p-3 rounded mb-4">
                {success}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {view === 'register' && (
              <div>
                <label className="block text-sm font-medium text-[#c9d1d9] mb-1">Nome</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-github-primary focus:border-transparent outline-none transition-all"
                  placeholder="Seu Nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
          )}
          <div>
            <label className="block text-sm font-medium text-[#c9d1d9] mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-github-primary focus:border-transparent outline-none transition-all"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#c9d1d9] mb-1">
                {view === 'forgot' ? 'Nova Senha' : 'Senha'}
            </label>
            <input 
              type="password" 
              required
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-github-primary focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {view === 'forgot' && (
             <div>
                <label className="block text-sm font-medium text-[#c9d1d9] mb-1">Confirmar Nova Senha</label>
                <input 
                type="password" 
                required
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-github-primary focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </div>
          )}
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white font-medium py-2 px-4 rounded-md transition-colors shadow-sm"
          >
            {loading ? 'Carregando...' : (view === 'login' ? 'Entrar' : view === 'register' ? 'Criar Conta' : 'Redefinir Senha')}
          </button>
        </form>
        
        {view === 'login' && (
            <div className="mt-4 text-center">
                <button onClick={() => setView('forgot')} className="text-xs text-github-primary hover:underline">
                    Esqueci minha senha
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

const ProfileScreen = () => {
    const { user, updateUserProfile, uploadAvatar, changePassword, deleteAccount, transactions, categories, banks, investments } = useApp();
    const [name, setName] = useState(user?.displayName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [timezone, setTimezone] = useState('America/Cuiaba');
    const [msg, setMsg] = useState('');
    const [deletePassword, setDeletePassword] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [msgType, setMsgType] = useState<'success' | 'error'>('success');
    
    // Password Change State
    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');

    // Sincronizar estado quando user mudar
    useEffect(() => {
        if (user) {
            setName(user.displayName || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const handleSave = () => {
        updateUserProfile(name, timezone);
        setMsg('Perfil atualizado com sucesso!');
        setMsgType('success');
        setTimeout(() => setMsg(''), 3000);
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) {
                alert('A imagem deve ter no máximo 2MB.');
                return;
            }
            try {
                await uploadAvatar(file);
                setMsg('Avatar atualizado!');
                setMsgType('success');
                setTimeout(() => setMsg(''), 3000);
            } catch (err) {
                console.error(err);
                alert('Erro ao atualizar avatar.');
            }
        }
    }
    
    const handleChangePassword = async () => {
        setMsg('');
        if (!oldPass || !newPass || !confirmPass) {
            setMsg('Preencha todos os campos de senha.');
            setMsgType('error');
            return;
        }
        if (newPass !== confirmPass) {
             setMsg('As novas senhas não coincidem.');
             setMsgType('error');
             return;
        }
        if (newPass.length < 4) {
             setMsg('A senha deve ter pelo menos 4 caracteres.');
             setMsgType('error');
             return;
        }

        try {
            await changePassword(oldPass, newPass);
            setMsg('Senha alterada com sucesso!');
            setMsgType('success');
            setOldPass('');
            setNewPass('');
            setConfirmPass('');
        } catch (err: any) {
            setMsg(err.toString());
            setMsgType('error');
        }
    }

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            setMsg('Digite sua senha para confirmar.');
            setMsgType('error');
            return;
        }

        try {
            await deleteAccount(deletePassword);
            setMsg('Conta excluída com sucesso.');
            setMsgType('success');
            // User will be logged out and redirected to auth screen
            setTimeout(() => window.location.reload(), 1500);
        } catch (err: any) {
            setMsg(err.toString());
            setMsgType('error');
        }
    }

    const handleExportData = async () => {
        try {
            const exportData = {
                usuario: {
                    nome: user?.displayName,
                    email: user?.email,
                    dataExportacao: new Date().toLocaleString('pt-BR'),
                },
                transacoes: transactions,
                categorias: categories,
                bancos: banks,
                investimentos: investments,
                resumo: {
                    totalTransacoes: transactions.length,
                    totalCategorias: categories.length,
                    totalBancos: banks.length,
                    totalInvestimentos: investments.length,
                }
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `meu-financeiro-exportacao-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setMsg('Dados exportados com sucesso!');
            setMsgType('success');
            setTimeout(() => setMsg(''), 3000);
        } catch (err: any) {
            setMsg('Erro ao exportar dados.');
            setMsgType('error');
        }
    }

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in pb-10">
            {/* Header com Avatar */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 bg-github-surface border border-github-border rounded-xl p-6 sm:p-8">
                    <div className="relative group cursor-pointer flex-shrink-0">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-github-primary to-github-primary/50 border-4 border-github-border flex items-center justify-center text-white text-5xl font-bold overflow-hidden shadow-lg">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                user?.displayName?.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white" size={28} />
                        </div>
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            onChange={handleFileChange}
                        />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-github-text mb-1">{user?.displayName}</h1>
                        <p className="text-github-muted mb-1">{user?.email}</p>
                        <p className="text-xs text-github-primary hover:underline cursor-pointer">Clique na foto para alterar avatar</p>
                    </div>
                </div>
            </div>

            {msg && (
                <div className={`mb-6 p-4 border rounded-lg flex items-start gap-3 animate-in slide-in-from-top ${
                    msgType === 'success' 
                    ? 'bg-github-success/10 text-github-success border-github-success' 
                    : 'bg-github-danger/10 text-github-danger border-github-danger'
                }`}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-sm">✓</div>
                    <span>{msg}</span>
                </div>
            )}

            {/* 1. Informações Pessoais */}
            <div className="bg-github-surface border border-github-border rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-5">
                    <UserIcon size={22} className="text-github-primary flex-shrink-0" />
                    <h3 className="text-lg font-bold text-github-text">Informações Pessoais</h3>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-github-text mb-2">Nome de Exibição</label>
                        <input 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            className="w-full bg-github-bg border border-github-border rounded-lg p-3 text-github-text outline-none focus:border-github-primary focus:ring-1 focus:ring-github-primary/30 transition-all" 
                            placeholder="Seu nome"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-github-text mb-2">Email</label>
                        <input 
                            disabled 
                            value={email} 
                            className="w-full bg-github-border/20 border border-github-border rounded-lg p-3 text-github-muted cursor-not-allowed opacity-60" 
                        />
                        <p className="text-xs text-github-muted mt-1">Email não pode ser alterado</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-github-text mb-2">Fuso Horário</label>
                        <select 
                            value={timezone} 
                            onChange={e => setTimezone(e.target.value)} 
                            className="w-full bg-github-bg border border-github-border rounded-lg p-3 text-github-text outline-none focus:border-github-primary focus:ring-1 focus:ring-github-primary/30 transition-all"
                        >
                            <option value="America/Cuiaba">🏠 Sinop, MT (America/Cuiaba) -04:00</option>
                            <option value="America/Sao_Paulo">🏛️ Brasília (America/Sao_Paulo) -03:00</option>
                            <option value="America/Manaus">🌳 Manaus, AM (America/Manaus) -04:00</option>
                        </select>
                    </div>
                    <div className="flex justify-end pt-2">
                        <Button onClick={handleSave} variant="primary">Salvar Alterações</Button>
                    </div>
                </div>
            </div>

            {/* 2. Saúde Financeira (Full Width) */}
            <FinancialHealthSettings />

            {/* 3. Exportar Dados */}
            <div className="bg-github-surface border border-github-border rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-5">
                    <Download size={22} className="text-github-primary flex-shrink-0" />
                    <h3 className="text-lg font-bold text-github-text">Exportar Dados</h3>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-github-muted">
                        Exporte todos os seus dados financeiros em formato JSON. Este arquivo pode ser compartilhado com seu contador ou utilizado para backup pessoal. O arquivo incluirá todas as suas transações, categorias, contas, investimentos e um resumo dos dados.
                    </p>
                    <div className="bg-github-bg/50 border border-github-border rounded-lg p-4 space-y-2">
                        <p className="text-xs text-github-muted font-medium">O arquivo exportado contém:</p>
                        <ul className="text-xs text-github-muted space-y-1 list-disc list-inside">
                            <li>Informações do usuário e data de exportação</li>
                            <li>Todas as transações registradas</li>
                            <li>Categorias e bancos configurados</li>
                            <li>Investimentos</li>
                            <li>Resumo geral dos dados</li>
                        </ul>
                    </div>
                    <Button onClick={handleExportData} variant="primary" className="w-full flex items-center justify-center gap-2">
                        <Download size={18} />
                        Exportar Dados para JSON
                    </Button>
                </div>
            </div>

            {/* 4. Segurança - Alterar Senha (Penúltimo) */}
            <div className="bg-github-surface border border-github-border rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-5">
                    <Key size={22} className="text-github-primary flex-shrink-0" />
                    <h3 className="text-lg font-bold text-github-text">Trocar Senha</h3>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-github-muted">Altere sua senha regularmente para manter sua conta segura.</p>
                    <div>
                        <label className="block text-sm font-medium text-github-text mb-2">Senha Atual</label>
                        <input 
                            type="password"
                            value={oldPass} 
                            onChange={e => setOldPass(e.target.value)} 
                            className="w-full bg-github-bg border border-github-border rounded-lg p-3 text-github-text outline-none focus:border-github-primary focus:ring-1 focus:ring-github-primary/30 transition-all" 
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-github-text mb-2">Nova Senha</label>
                            <input 
                                type="password"
                                value={newPass} 
                                onChange={e => setNewPass(e.target.value)} 
                                className="w-full bg-github-bg border border-github-border rounded-lg p-3 text-github-text outline-none focus:border-github-primary focus:ring-1 focus:ring-github-primary/30 transition-all" 
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-github-text mb-2">Confirmar Senha</label>
                            <input 
                                type="password"
                                value={confirmPass} 
                                onChange={e => setConfirmPass(e.target.value)} 
                                className="w-full bg-github-bg border border-github-border rounded-lg p-3 text-github-text outline-none focus:border-github-primary focus:ring-1 focus:ring-github-primary/30 transition-all" 
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <Button onClick={handleChangePassword} variant="secondary">Atualizar Senha</Button>
                    </div>
                </div>
            </div>

            {/* 5. Zona de Perigo - Excluir Conta (Último) */}
            <div className="bg-github-danger/5 border-2 border-github-danger/30 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-5">
                    <AlertTriangle size={22} className="text-github-danger flex-shrink-0" />
                    <h3 className="text-lg font-bold text-github-danger">Zona de Perigo</h3>
                </div>
                {!showDeleteConfirm ? (
                    <div className="space-y-4">
                        <p className="text-sm text-github-muted">Esta ação é <strong>irreversível</strong>. Todos os seus dados serão permanentemente deletados.</p>
                        <Button onClick={() => setShowDeleteConfirm(true)} variant="danger" className="w-full">Excluir Conta</Button>
                    </div>
                ) : (
                    <div className="space-y-4 bg-github-danger/20 p-4 rounded-lg border border-github-danger">
                        <div className="flex items-start gap-2">
                            <AlertTriangle size={18} className="text-github-danger flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-github-danger text-sm">Última chance!</p>
                                <p className="text-xs text-github-muted mt-1">Você está prestes a deletar sua conta permanentemente. Digite sua senha para confirmar.</p>
                            </div>
                        </div>
                        <input 
                            type="password"
                            value={deletePassword} 
                            onChange={e => setDeletePassword(e.target.value)} 
                            placeholder="Sua senha"
                            className="w-full bg-github-bg border border-github-danger/50 rounded-lg p-3 text-github-text outline-none focus:border-github-danger focus:ring-1 focus:ring-github-danger/30 transition-all" 
                        />
                        <div className="flex gap-2">
                            <Button 
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setDeletePassword('');
                                }} 
                                variant="secondary"
                                className="flex-1"
                            >
                                Cancelar
                            </Button>
                            <Button onClick={handleDeleteAccount} variant="danger" className="flex-1">Confirmar</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

const MainApp = () => {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showTransactionForm, setShowTransactionForm] = useState<'expense' | 'income' | null>(null);
  const [quickTransactionModal, setQuickTransactionModal] = useState<'expense' | 'income' | 'transfer' | null>(null);

  // Reset showTransactionForm quando mudar de aba
  useEffect(() => {
    if (activeTab !== 'transactions') {
      setShowTransactionForm(null);
    }
  }, [activeTab]);

  if (!user) return <AuthScreen />;

  const handleFabExpenseClick = () => {
    setQuickTransactionModal('expense');
  };

  const handleFabIncomeClick = () => {
    setQuickTransactionModal('income');
  };

  const handleFabTransferClick = () => {
    setQuickTransactionModal('transfer');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'transactions': return <Transactions initialTab={showTransactionForm || 'expense'} />;
      case 'credit': return <CreditCardsModule />;
      case 'investments': return <InvestmentsModule />;
      case 'banks': return <BanksModule />;
      case 'categories': return <CategoriesModule />;
      case 'profile': return <ProfileScreen />;
      default: return <Dashboard />;
    }
  };

  return (
    <>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
      </Layout>
      <FloatingActionButton 
        onExpenseClick={handleFabExpenseClick}
        onIncomeClick={handleFabIncomeClick}
        onTransferClick={handleFabTransferClick}
      />
      <QuickTransactionModal 
        isOpen={quickTransactionModal !== null}
        onClose={() => setQuickTransactionModal(null)}
        initialType={quickTransactionModal || 'expense'}
      />
    </>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
        <AppProvider>
        <MainApp />
        </AppProvider>
    </ErrorBoundary>
  );
}

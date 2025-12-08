
import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context';
import { Layout, Button } from './components/Layout';
import { FloatingActionButton } from './components/FloatingActionButton';
import { Dashboard } from './components/Dashboard';
import { Transactions } from './components/Transactions';
import { CreditCardsModule, BanksModule, CategoriesModule, InvestmentsModule } from './components/FinanceModules';
import { ShieldCheck, User as UserIcon, AlertTriangle, Camera, Lock, ArrowLeft } from 'lucide-react';

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
    const { user, updateUserProfile, uploadAvatar, changePassword, deleteAccount } = useApp();
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

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in pb-10">
            <h2 className="text-2xl font-bold border-b border-github-border pb-4 text-github-text">Configurações de Perfil</h2>
            
            <div className="flex items-center space-x-6">
                <div className="relative group cursor-pointer">
                    <div className="w-24 h-24 rounded-full bg-github-surface border-2 border-github-border flex items-center justify-center text-github-muted text-4xl font-bold overflow-hidden">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            user?.displayName?.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="text-white" size={24} />
                    </div>
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        onChange={handleFileChange}
                    />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-github-text">{user?.displayName}</h3>
                    <p className="text-github-muted">{user?.email}</p>
                    <p className="text-xs text-github-primary mt-1">Clique na foto para alterar</p>
                </div>
            </div>

            {msg && (
                <div className={`p-3 border rounded ${
                    msgType === 'success' 
                    ? 'bg-github-success/20 text-github-success border-github-success' 
                    : 'bg-github-danger/20 text-github-danger border-github-danger'
                }`}>
                    {msg}
                </div>
            )}

            {/* Public Profile Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-github-text">Dados Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-github-muted mb-1">Nome de Exibição</label>
                        <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-github-bg border border-github-border rounded p-2 text-github-text outline-none focus:border-github-primary" />
                    </div>
                     <div>
                        <label className="block text-sm text-github-muted mb-1">Email</label>
                        <input disabled value={email} className="w-full bg-github-surface border border-github-border rounded p-2 text-github-muted cursor-not-allowed" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-github-muted mb-1">Fuso Horário</label>
                    <select value={timezone} onChange={e => setTimezone(e.target.value)} className="w-full bg-github-bg border border-github-border rounded p-2 text-github-text outline-none">
                        <option value="America/Cuiaba">America/Cuiaba (MT) -04:00</option>
                        <option value="America/Sao_Paulo">America/Sao_Paulo (Brasília) -03:00</option>
                        <option value="America/Manaus">America/Manaus (AM) -04:00</option>
                    </select>
                </div>
                
                <div className="flex justify-end">
                    <Button onClick={handleSave} variant="primary">Salvar Perfil</Button>
                </div>
            </div>

            {/* Password Change Section */}
            <div className="space-y-4 pt-4 border-t border-github-border">
                 <h3 className="text-lg font-bold text-github-text flex items-center gap-2">
                     <Lock size={18} /> Alterar Senha
                 </h3>
                 <div className="grid grid-cols-1 gap-4">
                     <div>
                        <label className="block text-sm text-github-muted mb-1">Senha Atual</label>
                        <input 
                            type="password"
                            value={oldPass} 
                            onChange={e => setOldPass(e.target.value)} 
                            className="w-full bg-github-bg border border-github-border rounded p-2 text-github-text outline-none focus:border-github-primary" 
                            placeholder="••••••••"
                        />
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm text-github-muted mb-1">Nova Senha</label>
                            <input 
                                type="password"
                                value={newPass} 
                                onChange={e => setNewPass(e.target.value)} 
                                className="w-full bg-github-bg border border-github-border rounded p-2 text-github-text outline-none focus:border-github-primary" 
                                placeholder="••••••••"
                            />
                         </div>
                         <div>
                            <label className="block text-sm text-github-muted mb-1">Confirmar Nova Senha</label>
                            <input 
                                type="password"
                                value={confirmPass} 
                                onChange={e => setConfirmPass(e.target.value)} 
                                className="w-full bg-github-bg border border-github-border rounded p-2 text-github-text outline-none focus:border-github-primary" 
                                placeholder="••••••••"
                            />
                         </div>
                     </div>
                 </div>
                 <div className="flex justify-end">
                    <Button onClick={handleChangePassword} variant="secondary">Atualizar Senha</Button>
                </div>
            </div>

            <div className="pt-8 border-t border-github-border mt-8">
                <h3 className="text-lg font-medium text-github-danger mb-4">Zona de Perigo</h3>
                
                {!showDeleteConfirm ? (
                    <div className="p-4 bg-github-danger/10 border border-github-danger/30 rounded-lg">
                        <p className="text-sm text-github-muted mb-4">Esta ação é irreversível. Todos os seus dados serão permanentemente deletados.</p>
                        <Button onClick={() => setShowDeleteConfirm(true)} variant="danger">Excluir Conta</Button>
                    </div>
                ) : (
                    <div className="p-4 bg-github-danger/20 border border-github-danger rounded-lg space-y-4">
                        <div className="flex items-center gap-2 text-github-danger">
                            <AlertTriangle size={20} />
                            <span className="font-medium">ATENÇÃO: Você está prestes a deletar sua conta permanentemente</span>
                        </div>
                        <p className="text-sm text-github-muted">Digite sua senha para confirmar a exclusão:</p>
                        <input 
                            type="password"
                            value={deletePassword} 
                            onChange={e => setDeletePassword(e.target.value)} 
                            placeholder="Sua senha"
                            className="w-full bg-github-bg border border-github-border rounded p-2 text-github-text outline-none focus:border-github-danger"
                        />
                        <div className="flex justify-end gap-3">
                            <Button onClick={() => {
                                setShowDeleteConfirm(false);
                                setDeletePassword('');
                            }} variant="secondary">Cancelar</Button>
                            <Button onClick={handleDeleteAccount} variant="danger">Confirmar Exclusão</Button>
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

  // Reset showTransactionForm quando mudar de aba
  useEffect(() => {
    if (activeTab !== 'transactions') {
      setShowTransactionForm(null);
    }
  }, [activeTab]);

  if (!user) return <AuthScreen />;

  const handleFabExpenseClick = () => {
    setActiveTab('transactions');
    setShowTransactionForm('expense');
  };

  const handleFabIncomeClick = () => {
    setActiveTab('transactions');
    setShowTransactionForm('income');
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

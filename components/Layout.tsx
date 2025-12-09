import React, { useState, useEffect } from 'react';
import { useApp } from '../context';
import { 
  LayoutDashboard, 
  Receipt, 
  CreditCard, 
  Wallet, 
  Settings, 
  LogOut, 
  Menu as MenuIcon, 
  X,
  TrendingUp,
  Tags,
  Sun,
  Moon,
  MoreHorizontal,
  User
} from 'lucide-react';
import { SINOP_TIMEZONE } from '../utils';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
      active 
        ? 'bg-github-surface border-l-4 border-github-primary text-github-text font-medium' 
        : 'text-github-muted hover:text-github-text hover:bg-github-surface/50'
    }`}
  >
    <Icon size={20} />
    <span>{label}</span>
  </button>
);

export const Layout = ({ children, activeTab, setActiveTab }: { 
  children?: React.ReactNode, 
  activeTab: string, 
  setActiveTab: (t: string) => void 
}) => {
  const { user, logout, theme, toggleTheme } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transações', icon: Receipt },
    { id: 'credit', label: 'Cartões', icon: CreditCard },
    { id: 'investments', label: 'Investimentos', icon: TrendingUp },
    { id: 'banks', label: 'Contas', icon: Wallet },
    { id: 'categories', label: 'Categorias', icon: Tags },
    { id: 'profile', label: 'Perfil', icon: Settings },
  ];

  // Mobile Tabs (Bottom Navigation)
  const mobileTabs = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'transactions', label: 'Extrato', icon: Receipt },
    { id: 'credit', label: 'Cartões', icon: CreditCard },
    { id: 'menu', label: 'Menu', icon: MoreHorizontal }, // Opens drawer
  ];

  const timeString = currentDate.toLocaleTimeString('pt-BR', { timeZone: SINOP_TIMEZONE, hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex h-screen bg-github-bg text-github-text font-sans transition-colors duration-200">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-github-border bg-github-bg">
        <div className="p-6 border-b border-github-border flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-github-text">Meu Financeiro</h1>
            <p className="text-xs text-github-muted mt-1">Sinop, MT • {timeString}</p>
          </div>
          <button 
             onClick={toggleTheme}
             className="p-2 rounded-md hover:bg-github-surface text-github-muted hover:text-github-text transition-colors"
             title={theme === 'dark' ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
          >
             {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {tabs.map(tab => (
            <SidebarItem 
              key={tab.id}
              icon={tab.icon}
              label={tab.label}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-github-border">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-github-surface border border-github-border flex items-center justify-center overflow-hidden">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-github-text font-bold text-sm">{user?.displayName?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate text-github-text">{user?.displayName}</p>
              <p className="text-xs text-github-muted truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-github-danger hover:bg-github-surface rounded-md transition-colors"
          >
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header (Simplified) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-github-bg/80 backdrop-blur-md border-b border-github-border z-40 flex items-center justify-between px-4 transition-all">
        <div className="flex items-center gap-3">
             <div className="w-9 h-9 rounded-full bg-github-surface border border-github-border flex items-center justify-center overflow-hidden shadow-sm">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-github-text font-bold text-sm">{user?.displayName?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
                <p className="text-xs text-github-muted">Olá, {user?.displayName?.split(' ')[0]}</p>
                <h1 className="text-sm font-bold text-github-text">Meu Financeiro</h1>
            </div>
        </div>
        <button 
            onClick={toggleTheme}
            className="p-2 rounded-full bg-github-surface border border-github-border text-github-text shadow-sm active:scale-95 transition-all"
        >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-[80px] bg-github-surface border-t border-github-border z-50 flex items-start justify-around px-2 pb-4 pt-2 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        {mobileTabs.map((tab, index) => {
            const isActive = activeTab === tab.id || (tab.id === 'menu' && mobileMenuOpen);
            
            // Special case for Menu
            if (tab.id === 'menu') {
                return (
                    <button
                        key={tab.id}
                        onClick={() => setMobileMenuOpen(true)}
                        className={`flex flex-col items-center justify-center w-16 h-full space-y-1 transition-all duration-200 ${isActive ? 'text-github-primary' : 'text-github-muted hover:text-github-text'}`}
                    >
                        <tab.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">{tab.label}</span>
                    </button>
                );
            }

            return (
                <button
                    key={tab.id}
                    onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                    }}
                    className={`flex flex-col items-center justify-center w-16 h-full space-y-1 transition-all duration-200 ${isActive ? 'text-github-primary' : 'text-github-muted hover:text-github-text'}`}
                >
                    <tab.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">{tab.label}</span>
                </button>
            );
        })}
      </div>

      {/* Mobile Menu Drawer (Sheet) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative bg-github-surface rounded-t-[24px] p-6 animate-in slide-in-from-bottom duration-300 shadow-2xl border-t border-github-border max-h-[80vh] overflow-y-auto">
            <div className="w-12 h-1.5 bg-github-border rounded-full mx-auto mb-6" />
            
            <h3 className="text-lg font-bold text-github-text mb-4 px-2">Menu Principal</h3>
            
            <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                    { id: 'investments', label: 'Investir', icon: TrendingUp, color: 'bg-blue-500/10 text-blue-500' },
                    { id: 'banks', label: 'Contas', icon: Wallet, color: 'bg-purple-500/10 text-purple-500' },
                    { id: 'categories', label: 'Categorias', icon: Tags, color: 'bg-orange-500/10 text-orange-500' },
                    { id: 'profile', label: 'Perfil', icon: User, color: 'bg-green-500/10 text-green-500' },
                ].map(item => (
                    <button 
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                        className="flex flex-col items-center gap-2 p-2 rounded-xl active:bg-github-bg transition-colors"
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color}`}>
                            <item.icon size={24} />
                        </div>
                        <span className="text-xs font-medium text-github-text text-center">{item.label}</span>
                    </button>
                ))}
            </div>

            <div className="border-t border-github-border pt-4">
                <button 
                    onClick={logout}
                    className="w-full flex items-center space-x-3 px-4 py-4 text-github-danger bg-github-danger/5 hover:bg-github-danger/10 rounded-xl transition-colors font-medium"
                >
                    <LogOut size={20} />
                    <span>Sair da Conta</span>
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto md:p-8 pt-20 pb-24 px-4 scroll-smooth">
        {children}
      </main>
    </div>
  );
};

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`bg-github-surface border border-github-border rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.05)] w-full transition-all duration-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] ${className}`} {...props}>
    {children}
  </div>
);

export const Button = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  className = '',
  type = 'button',
  disabled = false
}: { 
  children?: React.ReactNode, 
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost', 
  onClick?: () => void,
  className?: string,
  type?: 'button' | 'submit',
  disabled?: boolean
}) => {
  const base = "min-h-[44px] px-6 py-2 rounded-xl font-semibold text-sm transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-github-bg disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-github-primary text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30 border border-transparent",
    secondary: "bg-github-surface text-github-text border border-github-border hover:bg-github-border hover:border-github-muted",
    danger: "bg-github-surface text-github-danger border border-github-border hover:bg-red-50 hover:border-red-200",
    ghost: "bg-transparent text-github-primary hover:bg-blue-50"
  };

  return (
    <button type={type} onClick={onClick} className={`${base} ${variants[variant]} ${className}`} disabled={disabled}>
      {children}
    </button>
  );
};

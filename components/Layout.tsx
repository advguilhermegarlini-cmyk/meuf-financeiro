import React, { useState, useEffect } from 'react';
import { useApp } from '../context';
import { 
  LayoutDashboard, 
  Receipt, 
  CreditCard, 
  Wallet, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  TrendingUp,
  Tags,
  Sun,
  Moon
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
    { id: 'banks', label: 'Minhas Contas', icon: Wallet },
    { id: 'categories', label: 'Categorias', icon: Tags },
    { id: 'profile', label: 'Perfil', icon: Settings },
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

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-github-surface border-b border-github-border z-50 flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-github-text">
             {mobileMenuOpen ? <X /> : <Menu />}
          </button>
          <span className="font-bold text-github-text">Meu Financeiro</span>
        </div>
        <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-github-border flex items-center justify-center overflow-hidden">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-github-text font-bold text-xs">{user?.displayName?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <button 
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-github-border text-github-text transition-colors"
            >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-github-bg pt-16 transition-colors duration-200">
          <nav className="p-4 space-y-2">
            {tabs.map(tab => (
              <SidebarItem 
                key={tab.id}
                icon={tab.icon}
                label={tab.label}
                active={activeTab === tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
              />
            ))}
            <button 
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-github-danger hover:bg-github-surface rounded-md transition-colors mt-8 border border-github-border"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto md:p-8 pt-20 p-4 scroll-smooth">
        {children}
      </main>
    </div>
  );
};

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`bg-github-surface border border-github-border rounded-lg shadow-sm ${className}`} {...props}>
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
  const base = "px-4 py-2 rounded-md font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-github-bg disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-github-success text-white hover:bg-green-600 border border-transparent shadow-sm focus:ring-github-success",
    secondary: "bg-github-surface text-github-text border border-github-border hover:bg-github-border hover:border-github-muted focus:ring-github-border",
    danger: "bg-github-surface text-github-danger border border-github-border hover:bg-github-danger hover:text-white focus:ring-github-danger",
    ghost: "bg-transparent text-github-primary hover:underline px-0 py-0"
  };

  return (
    <button type={type} onClick={onClick} className={`${base} ${variants[variant]} ${className}`} disabled={disabled}>
      {children}
    </button>
  );
};

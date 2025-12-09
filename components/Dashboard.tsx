
import React, { useState, useEffect } from 'react';
import { useApp } from '../context';
import { Card } from './Layout';
import { formatCurrency, getMonthName } from '../utils';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, ChevronLeft, ChevronRight, Calendar, Activity } from 'lucide-react';

const FinancialHealthMeter = ({ balance }: { balance: number }) => {
  // Determine color based on rules
  let color = '#3fb950'; // Default Green
  let label = 'Excelente';
  
  if (balance < -500) {
    color = '#FF0000'; // Vermelho Forte
    label = 'Crítico';
  } else if (balance <= 0) {
    color = '#FF6F91'; // Rosa Claro
    label = 'Atenção';
  } else if (balance <= 1000) {
    color = '#FFA500'; // Laranja
    label = 'Moderado';
  } else if (balance <= 2000) {
    color = '#90EE90'; // Verde Claro
    label = 'Bom';
  } else {
    color = '#006400'; // Verde Escuro
    label = 'Excelente';
  }

  // Calculate Percentage Height based on segmented ranges for better visual representation
  let percentage = 0;

  if (balance < -500) {
    // Zone 1: < -500 (0% to 15%)
    percentage = 10; 
  } else if (balance < 0) {
    // Zone 2: -500 to 0 (15% to 35%)
    // Map -500..0 to 0..20 add 15
    const relative = (balance + 500) / 500;
    percentage = 15 + (relative * 20);
  } else if (balance < 1000) {
    // Zone 3: 0 to 1000 (35% to 60%)
    const relative = balance / 1000;
    percentage = 35 + (relative * 25);
  } else if (balance < 2000) {
    // Zone 4: 1000 to 2000 (60% to 85%)
    const relative = (balance - 1000) / 1000;
    percentage = 60 + (relative * 25);
  } else {
    // Zone 5: > 2000 (85% to 100%)
    // Cap visual growth at 5000 for animation purposes
    const relative = Math.min((balance - 2000) / 3000, 1);
    percentage = 85 + (relative * 15);
  }

  return (
    <Card className="p-4 sm:p-6 h-full flex flex-col items-center justify-between relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-center justify-center w-full z-10 mb-3 sm:mb-4 gap-2 sm:gap-3">
         <Activity size={18} className="text-github-muted flex-shrink-0" />
         <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
           <h3 className="text-base sm:text-lg font-semibold text-github-text">Saúde Financeira</h3>
           <p className="text-xs text-github-muted mt-1">Baseado no mês e saldo previsto</p>
         </div>
      </div>
      
      <div className="relative w-20 flex-1 bg-github-border/20 rounded-2xl border border-github-border overflow-hidden flex items-end justify-center shadow-inner">
        {/* Background Scale Labels */}
        <div className="absolute right-0 w-full h-full pointer-events-none z-20">
            <div className="absolute bottom-[15%] w-full flex items-center">
                <div className="h-[1px] w-2 bg-github-muted/50"></div>
                <span className="text-[9px] text-github-muted ml-1">-500</span>
            </div>
            <div className="absolute bottom-[35%] w-full flex items-center">
                <div className="h-[1px] w-2 bg-github-muted/50"></div>
                <span className="text-[9px] text-github-muted ml-1">0</span>
            </div>
            <div className="absolute bottom-[60%] w-full flex items-center">
                <div className="h-[1px] w-2 bg-github-muted/50"></div>
                <span className="text-[9px] text-github-muted ml-1">1k</span>
            </div>
            <div className="absolute bottom-[85%] w-full flex items-center">
                <div className="h-[1px] w-2 bg-github-muted/50"></div>
                <span className="text-[9px] text-github-muted ml-1">2k</span>
            </div>
        </div>

        {/* Liquid Fill */}
        <div 
          className="w-full transition-all duration-1000 ease-out relative"
          style={{ 
            height: `${percentage}%`, 
            backgroundColor: color,
            boxShadow: `0 0 20px ${color}66`
          }}
        >
          {/* Bubble effect overlay */}
          <div className="absolute top-0 left-0 w-full h-2 bg-white/30" />
          <div className="absolute top-0 left-0 w-full h-[1px] bg-white/50" />
        </div>
      </div>

      <div className="text-center z-10 mt-4">
        <p className="text-xs text-github-muted uppercase tracking-wider font-semibold mb-1" style={{ color: color }}>{label}</p>
        <p className="text-xl font-bold font-mono transition-colors duration-500 text-github-text">
          {formatCurrency(balance)}
        </p>
      </div>
      
      {/* Background Glow */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-48 opacity-10 pointer-events-none transition-colors duration-1000"
        style={{ background: `linear-gradient(to top, ${color}, transparent)` }}
      />
    </Card>
  );
};

export const Dashboard = () => {
  const { transactions, getDashboardStats, getOverallBalanceAtDate, categories, theme } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const stats = getDashboardStats(selectedDate);
  const isFuture = selectedDate > new Date();

  const changeMonth = (offset: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setSelectedDate(newDate);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      // Input date is YYYY-MM-DD
      const [year, month] = e.target.value.split('-');
      const newDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      setSelectedDate(newDate);
    }
  };

  // Determine chart colors based on theme
  const chartTextColor = theme === 'light' ? '#24292f' : '#c9d1d9';
  const chartGridColor = theme === 'light' ? '#d0d7de' : '#30363d';
  const tooltipBg = theme === 'light' ? '#ffffff' : '#161b22';
  const tooltipBorder = theme === 'light' ? '#d0d7de' : '#30363d';

  // Prepare data for Category Pie Chart (Expenses only)
  const categoryData = categories.map(cat => {
    const total = transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.categoryId === cat.id && 
               t.type === 'expense' && 
               tDate.getUTCMonth() === selectedDate.getMonth() &&
               tDate.getUTCFullYear() === selectedDate.getFullYear();
      })
      .reduce((acc, t) => acc + t.amount, 0);
    return { name: cat.name, value: total, color: cat.color };
  }).filter(d => d.value > 0);

  // Prepare data for Cash Flow (Composed Chart)
  // Shows last 3 months + next 3 months (Total 6)
  const getCashFlowData = () => {
    const data = [];
    // Start 2 months ago, show 6 months total
    const startMonthOffset = -2;
    const endMonthOffset = 3;

    for (let i = startMonthOffset; i <= endMonthOffset; i++) {
      const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + i, 1);
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      
      const monthTx = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getUTCMonth() === d.getMonth() && tDate.getUTCFullYear() === d.getFullYear();
      });
      
      const inc = monthTx.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
      const exp = monthTx.filter(t => t.type === 'expense' && !t.isCreditCard).reduce((a, b) => a + b.amount, 0);
      
      const balanceAtEnd = getOverallBalanceAtDate(endOfMonth);

      data.push({
        name: d.toLocaleDateString('pt-BR', { month: 'short' }),
        Receitas: inc,
        Despesas: exp,
        SaldoAcumulado: balanceAtEnd
      });
    }
    return data;
  };

  const lineData = getCashFlowData();

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-github-text">Visão Geral</h2>
        
        <div className="flex items-center bg-github-surface border border-github-border rounded-lg p-1">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-github-border rounded-md text-github-muted hover:text-github-text transition-colors">
            <ChevronLeft size={20} />
          </button>
          
          <div className="relative px-4 text-center group cursor-pointer">
             <span className="text-lg font-medium capitalize block w-32 text-github-text">
                {selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
             </span>
             {/* Hidden Date Input overlay for picker functionality */}
             <input 
               type="month" 
               className="absolute inset-0 opacity-0 cursor-pointer"
               onChange={handleDateChange}
             />
          </div>

          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-github-border rounded-md text-github-muted hover:text-github-text transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5 border-l-4 border-l-github-success">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-github-muted">Receitas</p>
              <h3 className="text-xl sm:text-2xl font-bold text-github-text mt-2 break-words">{formatCurrency(stats.income)}</h3>
            </div>
            <div className="p-2 bg-github-success/10 rounded-lg text-github-success flex-shrink-0">
              <TrendingUp size={20} />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 border-l-4 border-l-github-danger">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-github-muted">Despesas</p>
              <h3 className="text-xl sm:text-2xl font-bold text-github-text mt-2 break-words">{formatCurrency(stats.expenses)}</h3>
            </div>
            <div className="p-2 bg-github-danger/10 rounded-lg text-github-danger flex-shrink-0">
              <TrendingDown size={20} />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 border-l-4 border-l-github-primary">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-github-muted">
                  {isFuture ? 'Saldo Previsto' : 'Saldo (Realizado)'}
              </p>
              <h3 className={`text-xl sm:text-2xl font-bold mt-2 break-words ${stats.balance >= 0 ? 'text-github-primary' : 'text-github-danger'}`}>
                {formatCurrency(stats.balance)}
              </h3>
            </div>
            <div className="p-2 bg-github-primary/10 rounded-lg text-github-primary flex-shrink-0">
              <DollarSign size={20} />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 border-l-4 border-l-github-warning">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-github-muted">Fatura Aberta (Mês)</p>
              <h3 className="text-xl sm:text-2xl font-bold text-github-text mt-2 break-words">{formatCurrency(stats.creditCardBill)}</h3>
            </div>
            <div className="p-2 bg-github-warning/10 rounded-lg text-github-warning flex-shrink-0">
              <CreditCard size={20} />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts & Meter */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {/* Cash Flow Chart */}
        <Card className="p-4 sm:p-6 lg:col-span-2">
          <div className="mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-github-text">Fluxo de Caixa (Previsão 6 Meses)</h3>
          </div>
          <div className="h-64 w-full" style={{ minHeight: 256 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
                <XAxis dataKey="name" stroke="#8b949e" tick={{fill: '#8b949e', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" stroke="#8b949e" tick={{fill: '#8b949e', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(val) => `${val/1000}k`} />
                <YAxis yAxisId="right" orientation="right" stroke="#58a6ff" tick={{fill: '#58a6ff', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(val) => `${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: chartTextColor, borderRadius: '8px' }}
                  itemStyle={{ color: chartTextColor }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar yAxisId="left" dataKey="Receitas" fill="#3fb950" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar yAxisId="left" dataKey="Despesas" fill="#f85149" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Line yAxisId="right" type="monotone" dataKey="SaldoAcumulado" stroke="#58a6ff" strokeWidth={3} dot={{r: 4}} name="Saldo Acumulado" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pie Chart */}
        <Card className="p-4 sm:p-6 lg:col-span-1">
          <div className="mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-github-text">Gastos por Categoria</h3>
          </div>
          <div className="h-64 w-full flex flex-col items-center justify-center" style={{ minHeight: 256 }}>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: chartTextColor, borderRadius: '8px' }}
                    itemStyle={{ color: chartTextColor }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-github-muted text-xs sm:text-sm">Sem dados este mês</p>
            )}
            <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 text-xs w-full">
              {categoryData.slice(0, 4).map((cat, i) => (
                <div key={i} className="flex items-center space-x-2 min-w-0">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="truncate text-github-muted text-xs">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Financial Health Meter (New Component) */}
        <div className="lg:col-span-1 h-80 lg:h-auto">
            <FinancialHealthMeter balance={stats.balance} />
        </div>
      </div>

      {/* Recent Transactions */}
      <Card className="overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-github-border flex justify-between items-center">
          <h3 className="text-base sm:text-lg font-semibold text-github-text">Movimentações do Mês</h3>
        </div>
        <div className="divide-y divide-github-border">
          {transactions
            .filter(t => {
               const tDate = new Date(t.date);
               return tDate.getUTCMonth() === selectedDate.getMonth() && tDate.getUTCFullYear() === selectedDate.getFullYear();
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5)
            .map(t => {
            const isExp = t.type === 'expense';
            const cat = categories.find(c => c.id === t.categoryId);
            return (
              <div key={t.id} className="p-3 sm:p-4 flex items-center justify-between hover:bg-github-bg/50 transition-colors gap-3">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    t.type === 'transfer' ? 'bg-github-muted/10 text-github-muted' :
                    isExp ? 'bg-github-danger/10 text-github-danger' : 'bg-github-success/10 text-github-success'
                  }`}>
                    {t.type === 'transfer' ? <DollarSign size={18} /> : (isExp ? <TrendingDown size={18} /> : <TrendingUp size={18} />)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-github-text text-sm break-words">
                        {t.description}
                        {t.installments && <span className="ml-1 text-xs text-github-muted">({t.installmentNumber}/{t.installments})</span>}
                    </p>
                    <p className="text-xs text-github-muted flex items-center gap-2 mt-1">
                      <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat?.color || '#ccc' }}></span>
                      <span className="truncate">{cat?.name} • {new Date(t.date).toLocaleDateString('pt-BR')}</span>
                    </p>
                  </div>
                </div>
                <span className={`font-mono font-medium text-sm sm:text-base flex-shrink-0 ${
                    t.type === 'transfer' ? 'text-github-text' :
                    isExp ? 'text-github-danger' : 'text-github-success'
                }`}>
                  {t.type === 'transfer' ? '' : (isExp ? '-' : '+')}{formatCurrency(t.amount)}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

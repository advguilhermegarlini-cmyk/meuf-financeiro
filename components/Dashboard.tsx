import React, { useState, useEffect } from 'react';
import { useApp } from '../context';
import { Card } from './Layout';
import { formatCurrency, getMonthName } from '../utils';
import { HealthSettings } from '../types';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Legend,
  AreaChart, Area
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, ChevronLeft, ChevronRight, Calendar, Activity } from 'lucide-react';

// Interactive Pie Chart Component
interface InteractivePieChartProps {
  data: Array<{ name: string; value: number; color: string }>;
}

const InteractivePieChart: React.FC<InteractivePieChartProps> = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { theme } = useApp();

  const RADIAN = Math.PI / 180;
  
  const renderCustomLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, index
  }: any) => {
    // Só mostra percentual se o slice estiver ativo
    if (activeIndex !== index) return null;

    const radius = outerRadius + 50;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <g>
        <text
          x={x}
          y={y}
          fill={data[index]?.color || '#ffffff'}
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
          className="font-bold text-sm sm:text-base pointer-events-none"
          style={{
            animation: 'fadeIn 0.3s ease-in',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          {`${(percent * 100).toFixed(1)}%`}
        </text>
      </g>
    );
  };

  if (data.length === 0) {
    return (
      <div className="h-64 w-full flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-github-border/20 flex items-center justify-center mb-3">
          <DollarSign size={28} className="text-github-muted" />
        </div>
        <p className="text-github-muted text-sm font-medium">Sem dados este mês</p>
        <p className="text-github-muted text-xs mt-1">Adicione transações para visualizar</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-4">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      
      <div className="h-72 sm:h-80 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {data.map((entry, index) => (
                <linearGradient key={`grad-${index}`} id={`grad-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                  <stop offset="100%" stopColor={entry.color} stopOpacity={0.75} />
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={activeIndex !== null ? 100 : 88}
              innerRadius={50}
              paddingAngle={activeIndex !== null ? 3 : 2}
              dataKey="value"
              onClick={(_, index) => setActiveIndex(activeIndex === index ? null : index)}
              onMouseEnter={(_, index) => {
                if (activeIndex === null) {
                  setActiveIndex(index);
                }
              }}
              onMouseLeave={() => {
                if (activeIndex !== null) {
                  setActiveIndex(null);
                }
              }}
              animationDuration={400}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`url(#grad-${index})`}
                  stroke={theme === 'dark' ? '#0d1117' : '#ffffff'}
                  strokeWidth={activeIndex === index ? 2 : 1}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.5}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    filter: activeIndex === index 
                      ? 'drop-shadow(0px 12px 24px rgba(0, 0, 0, 0.3))' 
                      : 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1))',
                  }}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: theme === 'dark' ? '#0d1117' : '#ffffff',
                borderColor: theme === 'dark' ? '#30363d' : '#d1d5db',
                borderWidth: 1,
                borderRadius: '8px',
                padding: '10px 14px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              }}
              itemStyle={{ color: theme === 'dark' ? '#c9d1d9' : '#1f2937', fontWeight: 600, fontSize: '13px' }}
              formatter={(value: number, name: string, props: any) => {
                const percent = ((value / total) * 100).toFixed(1);
                return [`${formatCurrency(value)} • ${percent}%`, ''];
              }}
              labelStyle={{ display: 'none' }}
              cursor={{ fill: 'transparent' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend com detalhes - Melhorada */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 px-1">
        {data.map((item, index) => {
          const percent = ((item.value / total) * 100).toFixed(1);
          const isActive = activeIndex === index;

          return (
            <div
              key={index}
              onClick={() => setActiveIndex(isActive ? null : index)}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-300 group ${
                isActive
                  ? 'scale-105 shadow-md'
                  : 'border-github-border/30 hover:border-github-border hover:shadow-sm'
              }`}
              style={
                isActive
                  ? {
                      backgroundColor: `${item.color}15`,
                      borderColor: item.color,
                    }
                  : {}
              }
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div
                    className={`w-3 h-3 rounded-sm flex-shrink-0 transition-all duration-300 ${
                      isActive ? 'scale-150' : 'group-hover:scale-110'
                    }`}
                    style={{ backgroundColor: item.color }}
                  />
                  <span className={`text-sm font-medium truncate transition-colors duration-300 ${
                    isActive ? 'text-github-text font-semibold' : 'text-github-muted group-hover:text-github-text'
                  }`}>
                    {item.name}
                  </span>
                </div>
              </div>
              
              {/* Valores mostrados ao expandir */}
              {isActive && (
                <div className="flex items-center justify-between mt-2.5 ml-5 pt-2.5 border-t border-github-border/20 animate-in fade-in duration-300">
                  <span className="text-xs font-bold text-github-text">
                    {formatCurrency(item.value)}
                  </span>
                  <span className="text-xs font-bold" style={{ color: item.color }}>
                    {percent}%
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Default health settings
const DEFAULT_HEALTH_SETTINGS: HealthSettings = {
  criticalThreshold: -500,
  attentionThreshold: 0,
  moderateThreshold: 1000,
  goodThreshold: 2000,
};

const FinancialHealthMeter = ({ balance, healthSettings }: { balance: number; healthSettings?: HealthSettings }) => {
  const settings = healthSettings || DEFAULT_HEALTH_SETTINGS;

  // Determine color based on settings
  let color = '#006400'; // Default Dark Green (Excellent)
  let label = 'Excelente';
  
  if (balance < settings.criticalThreshold) {
    color = '#FF0000'; // Red
    label = 'Crítico';
  } else if (balance < settings.attentionThreshold) {
    color = '#FF6F91'; // Pink
    label = 'Atenção';
  } else if (balance < settings.moderateThreshold) {
    color = '#FFA500'; // Orange
    label = 'Moderado';
  } else if (balance < settings.goodThreshold) {
    color = '#90EE90'; // Light Green
    label = 'Bom';
  } else {
    color = '#006400'; // Dark Green
    label = 'Excelente';
  }

  // Calculate Percentage Height based on segmented ranges
  let percentage = 0;
  const zoneSize = 20; // Each zone is roughly 20% of the bar

  if (balance < settings.criticalThreshold) {
    percentage = 10;
  } else if (balance < settings.attentionThreshold) {
    const range = settings.attentionThreshold - settings.criticalThreshold;
    const relative = (balance - settings.criticalThreshold) / range;
    percentage = 10 + (relative * zoneSize);
  } else if (balance < settings.moderateThreshold) {
    const range = settings.moderateThreshold - settings.attentionThreshold;
    const relative = (balance - settings.attentionThreshold) / range;
    percentage = 30 + (relative * zoneSize);
  } else if (balance < settings.goodThreshold) {
    const range = settings.goodThreshold - settings.moderateThreshold;
    const relative = (balance - settings.moderateThreshold) / range;
    percentage = 50 + (relative * zoneSize);
  } else {
    // Excellent: scale to 100%
    const relative = Math.min((balance - settings.goodThreshold) / (settings.goodThreshold * 2), 1);
    percentage = 70 + (relative * 30);
  }

  percentage = Math.max(5, Math.min(100, percentage));

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
        {/* Background Scale Labels - Dynamic based on settings */}
        <div className="absolute right-0 w-full h-full pointer-events-none z-20">
            <div className="absolute bottom-[10%] w-full flex items-center">
                <div className="h-[1px] w-2 bg-github-muted/50"></div>
                <span className="text-[9px] text-github-muted ml-1">{formatCurrency(settings.criticalThreshold)}</span>
            </div>
            <div className="absolute bottom-[30%] w-full flex items-center">
                <div className="h-[1px] w-2 bg-github-muted/50"></div>
                <span className="text-[9px] text-github-muted ml-1">{formatCurrency(settings.attentionThreshold)}</span>
            </div>
            <div className="absolute bottom-[50%] w-full flex items-center">
                <div className="h-[1px] w-2 bg-github-muted/50"></div>
                <span className="text-[9px] text-github-muted ml-1">{formatCurrency(settings.moderateThreshold)}</span>
            </div>
            <div className="absolute bottom-[70%] w-full flex items-center">
                <div className="h-[1px] w-2 bg-github-muted/50"></div>
                <span className="text-[9px] text-github-muted ml-1">{formatCurrency(settings.goodThreshold)}</span>
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
  const { user, transactions, getDashboardStats, getOverallBalanceAtDate, categories, theme } = useApp();
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
    <div className="space-y-4 md:space-y-6">
      {/* Header with Navigation */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-github-text">Visão Geral</h2>
        
        <div className="flex items-center bg-github-surface border border-github-border rounded-lg p-1">
          <button onClick={() => changeMonth(-1)} className="p-1.5 md:p-2 hover:bg-github-border rounded-md text-github-muted hover:text-github-text transition-colors">
            <ChevronLeft size={18} />
          </button>
          
          <div className="relative px-2 md:px-4 text-center group cursor-pointer">
             <span className="text-sm md:text-lg font-medium capitalize block text-github-text">
                {selectedDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
             </span>
             {/* Hidden Date Input overlay for picker functionality */}
             <input 
               type="month" 
               className="absolute inset-0 opacity-0 cursor-pointer"
               onChange={handleDateChange}
             />
          </div>

          <button onClick={() => changeMonth(1)} className="p-1.5 md:p-2 hover:bg-github-border rounded-md text-github-muted hover:text-github-text transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="p-5 md:p-6 border-l-4 border-l-github-success bg-gradient-to-br from-github-surface to-green-500/5 hover:to-green-500/10 transition-all hover:shadow-lg">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm text-github-muted font-semibold uppercase tracking-wide">Receitas</p>
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-github-text mt-2 break-words font-mono">{formatCurrency(stats.income)}</h3>
            </div>
            <div className="p-3 bg-github-success/10 rounded-xl text-github-success flex-shrink-0 shadow-sm">
              <TrendingUp size={20} className="md:w-6 md:h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5 md:p-6 border-l-4 border-l-github-danger bg-gradient-to-br from-github-surface to-red-500/5 hover:to-red-500/10 transition-all hover:shadow-lg">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm text-github-muted font-semibold uppercase tracking-wide">Despesas</p>
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-github-text mt-2 break-words font-mono">{formatCurrency(stats.expenses)}</h3>
            </div>
            <div className="p-3 bg-github-danger/10 rounded-xl text-github-danger flex-shrink-0 shadow-sm">
              <TrendingDown size={20} className="md:w-6 md:h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5 md:p-6 border-l-4 border-l-github-primary bg-gradient-to-br from-github-surface to-blue-500/5 hover:to-blue-500/10 transition-all hover:shadow-lg">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm text-github-muted font-semibold uppercase tracking-wide">
                  {isFuture ? 'Saldo Previsto' : 'Saldo (Realizado)'}
              </p>
              <h3 className={`text-xl md:text-2xl lg:text-3xl font-bold mt-2 break-words font-mono ${stats.balance >= 0 ? 'text-github-primary' : 'text-github-danger'}`}>
                {formatCurrency(stats.balance)}
              </h3>
            </div>
            <div className="p-3 bg-github-primary/10 rounded-xl text-github-primary flex-shrink-0 shadow-sm">
              <DollarSign size={20} className="md:w-6 md:h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5 md:p-6 border-l-4 border-l-github-warning bg-gradient-to-br from-github-surface to-orange-500/5 hover:to-orange-500/10 transition-all hover:shadow-lg">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm text-github-muted font-semibold uppercase tracking-wide">Fatura Aberta</p>
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-github-text mt-2 break-words font-mono">{formatCurrency(stats.creditCardBill)}</h3>
            </div>
            <div className="p-3 bg-github-warning/10 rounded-xl text-github-warning flex-shrink-0 shadow-sm">
              <CreditCard size={20} className="md:w-6 md:h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts & Meter */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
        {/* Modern Area Chart - Gráfico de Área */}
        <Card className="p-4 sm:p-5 md:p-6 lg:col-span-2 relative overflow-hidden">
          <div className="mb-3 md:mb-4 relative z-10">
            <h3 className="text-sm md:text-lg font-bold text-github-text">Gráfico de Área</h3>
            <p className="text-xs text-github-muted mt-1">Evolução dos últimos 6 meses</p>
          </div>
          <div className="h-64 w-full" style={{ minHeight: 256 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d946ef" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} opacity={0.3} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke={chartTextColor}
                  tick={{fill: chartTextColor, fontSize: 11, fontWeight: 500}} 
                  axisLine={false} 
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke={chartTextColor}
                  tick={{fill: chartTextColor, fontSize: 11}} 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}
                  width={40}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: tooltipBg, 
                    borderColor: '#d946ef',
                    borderWidth: 2,
                    color: chartTextColor, 
                    borderRadius: '12px',
                    padding: '12px',
                    boxShadow: '0 10px 40px rgba(217, 70, 239, 0.3)'
                  }}
                  itemStyle={{ color: chartTextColor, fontWeight: 600 }}
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ fontWeight: 700, marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="SaldoAcumulado" 
                  stroke="#d946ef" 
                  strokeWidth={3}
                  fill="url(#areaGradient)" 
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Modern Interactive 3D Pie Chart - Gráfico de Pizza Interativo */}
        <Card className="p-4 sm:p-5 md:p-6 lg:col-span-1 relative overflow-hidden">
          <div className="mb-3 sm:mb-4 relative z-10">
            <h3 className="text-base sm:text-lg font-bold text-github-text">Distribuição de Despesas</h3>
            <p className="text-xs text-github-muted mt-1">Clique nos slices para expandir</p>
          </div>
          <InteractivePieChart data={categoryData} />
        </Card>

        {/* Financial Health Meter (New Component) */}
        <div className="lg:col-span-1 h-80 lg:h-auto">
            <FinancialHealthMeter balance={stats.balance} healthSettings={user?.healthSettings} />
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

import React, { useState, useMemo } from 'react';
import { useFinancials } from '../context/FinancialContext';
import { getFinancialInsight } from '../services/geminiService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { DollarSign, TrendingUp, Package, AlertCircle, Sparkles, Send } from 'lucide-react';
import { TransactionType } from '../types';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from './UI';

const Dashboard: React.FC = () => {
  const { transactions, products, invoices } = useFinancials();
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Calculate Metrics
  const totalRevenue = transactions
    .filter(t => t.type === TransactionType.SALE || t.type === TransactionType.INVOICE_PAYMENT)
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = Math.abs(transactions
    .filter(t => t.type === TransactionType.EXPENSE || t.type === TransactionType.RESTOCK)
    .reduce((acc, t) => acc + t.amount, 0));

  const netProfit = totalRevenue - totalExpenses;
  const lowStockCount = products.filter(p => p.stock < 10).length;

  // Prepare Chart Data
  const chartData = useMemo(() => {
    const data: any[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const dayRevenue = transactions
        .filter(t => t.date.startsWith(dateStr) && t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
        
      data.push({ name: dateStr.slice(5), revenue: dayRevenue });
    }
    return data;
  }, [transactions]);

  const handleAiAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setLoadingAi(true);
    const response = await getFinancialInsight(aiQuery, { transactions, products, invoices });
    setAiResponse(response);
    setLoadingAi(false);
    setAiQuery('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Financial Overview</h1>
        <div className="text-sm text-slate-500">Last updated: Just now</div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
            title="Total Revenue" 
            value={`R${totalRevenue.toLocaleString()}`} 
            icon={<DollarSign size={20} />} 
            iconBg="bg-emerald-50 text-emerald-600" 
        />
        <KpiCard 
            title="Net Profit" 
            value={`R${netProfit.toLocaleString()}`} 
            valueClass={netProfit >= 0 ? 'text-slate-900' : 'text-rose-500'}
            icon={<TrendingUp size={20} />} 
            iconBg="bg-blue-50 text-blue-600" 
        />
        <KpiCard 
            title="Expenses" 
            value={`R${totalExpenses.toLocaleString()}`} 
            icon={<AlertCircle size={20} />} 
            iconBg="bg-rose-50 text-rose-600" 
        />
        <KpiCard 
            title="Low Stock Alerts" 
            value={lowStockCount} 
            icon={<Package size={20} />} 
            iconBg={lowStockCount > 0 ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-400'} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChartComponent data={chartData} />
                </ResponsiveContainer>
            </CardContent>
        </Card>

        {/* AI Assistant */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-xl shadow-lg text-white flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-yellow-300" size={20} />
            <h3 className="text-lg font-semibold">Gemini Financial Advisor</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto mb-4 bg-white/10 rounded-lg p-3 min-h-[150px] text-sm leading-relaxed scrollbar-thin scrollbar-thumb-white/20">
            {aiResponse ? (
              <p>{aiResponse}</p>
            ) : (
              <p className="text-indigo-200">Ask me anything about your finances, stock levels, or invoice status...</p>
            )}
          </div>

          <form onSubmit={handleAiAsk} className="relative">
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Ex: How are sales compared to last week?"
              className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-3 pr-10 text-sm text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button 
              type="button"
              onClick={(e) => handleAiAsk(e as any)}
              disabled={loadingAi}
              className="absolute right-2 top-1.5 text-indigo-200 hover:text-white disabled:opacity-50"
            >
              {loadingAi ? <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div> : <Send size={16} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, icon, iconBg, valueClass = "text-slate-900" }: any) => (
    <Card>
        <CardContent className="p-6">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <h3 className={`text-2xl font-bold mt-1 ${valueClass}`}>{value}</h3>
                </div>
                <div className={`p-2 rounded-lg ${iconBg}`}>
                    {icon}
                </div>
            </div>
        </CardContent>
    </Card>
);

const AreaChartComponent = ({ data }: { data: any[] }) => (
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `R${value}`} />
      <RechartsTooltip 
        cursor={{fill: '#f1f5f9'}}
        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
      />
      <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
    </BarChart>
);

export default Dashboard;
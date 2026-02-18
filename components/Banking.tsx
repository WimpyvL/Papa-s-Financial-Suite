import React, { useMemo, useState } from 'react';
import { useFinancials } from '../context/FinancialContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Landmark, Wallet, ChevronDown, ChevronUp, Plus, Upload, Building2, Banknote, HelpCircle } from 'lucide-react';
import { Card, CardContent, Button } from './UI';
import { Transaction } from '../types';

const Banking: React.FC = () => {
  const { bankAccounts, transactions } = useFinancials();
  const [expandedAccount, setExpandedAccount] = useState<string | null>(null);

  // Helper: Get Balance for a specific account
  const getAccountBalance = (accountId: string) => {
    return transactions
      .filter(t => t.accountId === accountId)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Helper: Get Total Balance by Type
  const getTotalBalanceByType = (type: 'BANK' | 'CASH') => {
    const accountIds = bankAccounts.filter(a => a.type === type).map(a => a.id);
    return transactions
      .filter(t => t.accountId && accountIds.includes(t.accountId))
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const cashInHand = getTotalBalanceByType('CASH');
  const bankBalance = getTotalBalanceByType('BANK');

  // Chart Data: Last 30 Days trend for Cash vs Bank
  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();
    
    // Initial balances before 30 days ago (for cumulative calc)
    const startDate = new Date();
    startDate.setDate(today.getDate() - 30);
    
    // Helper to calculate balance up to a date
    const getBalanceAtDate = (date: Date, type: 'BANK' | 'CASH') => {
        const accIds = bankAccounts.filter(a => a.type === type).map(a => a.id);
        const isoDate = date.toISOString().split('T')[0];
        
        // Filter transactions strictly BEFORE the next day
        // Simplified: string compare YYYY-MM-DD
        return transactions.reduce((sum, t) => {
            if (accIds.includes(t.accountId || '') && t.date.split('T')[0] <= isoDate) {
                return sum + t.amount;
            }
            return sum;
        }, 0);
    };

    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateLabel = d.getDate().toString() + ' ' + d.toLocaleString('default', { month: 'short' });
        
        data.push({
            name: dateLabel,
            Cash: getBalanceAtDate(d, 'CASH'),
            Bank: getBalanceAtDate(d, 'BANK')
        });
    }
    return data;
  }, [transactions, bankAccounts]);

  const toggleExpand = (id: string) => {
    setExpandedAccount(expandedAccount === id ? null : id);
  };

  const getAccountIcon = (type: string) => {
    switch(type) {
        case 'BANK': return <Building2 size={20} className="text-slate-600" />;
        case 'CASH': return <Banknote size={20} className="text-slate-600" />;
        default: return <HelpCircle size={20} className="text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Banking Overview</h1>
        <div className="flex gap-2">
            <Button variant="outline" className="gap-2 bg-white text-slate-700">
                <Upload size={18} /> Import Statement
            </Button>
            <Button className="gap-2 bg-emerald-500 hover:bg-emerald-600 border-transparent text-white shadow-md">
                <Plus size={18} /> Add Manually
            </Button>
        </div>
      </div>

      {/* KPI Cards & Chart */}
      <Card className="p-6 border border-slate-200 shadow-sm bg-white">
        <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2 text-sm font-medium text-slate-600 cursor-pointer hover:text-indigo-600 items-center">
                All Accounts <ChevronDown size={16} />
            </div>
            <div className="text-sm text-slate-400">
                 Last 30 days ▼
            </div>
        </div>

        <div className="flex gap-8 mb-8">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <Wallet size={20} />
                </div>
                <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Cash In Hand</p>
                    <p className="text-xl font-bold text-slate-800">R{cashInHand.toLocaleString()}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Landmark size={20} />
                </div>
                <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Bank Balance</p>
                    <p className="text-xl font-bold text-slate-800">R{bankBalance.toLocaleString()}</p>
                </div>
            </div>
        </div>

        <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorBank" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#64748b" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} minTickGap={30} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} tickFormatter={(val) => `R${val/1000}k`} />
                    <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                    />
                    <Area type="monotone" dataKey="Bank" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorBank)" />
                    <Area type="monotone" dataKey="Cash" stroke="#64748b" strokeWidth={2} fillOpacity={1} fill="url(#colorCash)" />
                </AreaChart>
             </ResponsiveContainer>
        </div>
      </Card>

      {/* Account List */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            Active Accounts <ChevronDown size={18} className="text-indigo-600" />
        </h3>
        
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <div className="col-span-5">Account Details</div>
                <div className="col-span-2 text-center">Uncategorized</div>
                <div className="col-span-2 text-right">Amount in Bank</div>
                <div className="col-span-2 text-right">System Balance</div>
                <div className="col-span-1"></div>
            </div>

            <div className="divide-y divide-slate-100">
                {bankAccounts.map(account => {
                    const balance = getAccountBalance(account.id);
                    return (
                        <div key={account.id} className="group transition-colors hover:bg-slate-50/50">
                            <div 
                                className="grid grid-cols-12 gap-4 p-4 items-center cursor-pointer"
                                onClick={() => toggleExpand(account.id)}
                            >
                                <div className="col-span-5 flex items-center gap-4">
                                    <div className={`p-2 rounded-lg border ${account.type === 'BANK' ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-100 border-slate-200'}`}>
                                        {getAccountIcon(account.type)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-indigo-600 hover:underline">{account.name}</p>
                                        <p className="text-xs text-slate-400">{account.accountNumber} • {account.currency}</p>
                                    </div>
                                </div>
                                <div className="col-span-2 text-center">
                                    {/* Mock Uncategorized */}
                                    <span className="text-xs text-slate-400 font-medium">-</span>
                                </div>
                                <div className="col-span-2 text-right text-sm text-slate-500 font-medium">
                                    {/* Mock Bank Balance (Simulating it matches system for now) */}
                                    R{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                                <div className="col-span-2 text-right text-sm font-bold text-slate-800">
                                    R{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                                <div className="col-span-1 flex justify-end text-slate-400">
                                    {expandedAccount === account.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </div>
                            </div>
                            
                            {/* Expandable Details Area (Mock) */}
                            {expandedAccount === account.id && (
                                <div className="bg-slate-50 p-4 border-t border-slate-100 animate-in slide-in-from-top-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-slate-500 uppercase">Recent Activity</span>
                                        <Button size="sm" variant="ghost" className="text-indigo-600 h-6 text-xs">View All Transactions</Button>
                                    </div>
                                    <div className="space-y-2">
                                        {transactions.filter(t => t.accountId === account.id).slice(0, 3).map(t => (
                                            <div key={t.id} className="flex justify-between text-xs bg-white p-2 rounded border border-slate-200">
                                                <span className="text-slate-600">{t.description}</span>
                                                <span className={`font-mono ${t.amount < 0 ? 'text-slate-800' : 'text-emerald-600'}`}>
                                                    R{Math.abs(t.amount).toFixed(2)} {t.amount < 0 ? 'Dr' : 'Cr'}
                                                </span>
                                            </div>
                                        ))}
                                        {transactions.filter(t => t.accountId === account.id).length === 0 && (
                                            <p className="text-xs text-slate-400 italic">No recent transactions found.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Banking;
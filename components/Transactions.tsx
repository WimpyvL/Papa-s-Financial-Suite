import React from 'react';
import { useFinancials } from '../context/FinancialContext';
import { TransactionType } from '../types';
import { ArrowUpRight, ArrowDownLeft, FileText, ShoppingBag } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from './UI';

const Transactions: React.FC = () => {
  const { transactions } = useFinancials();

  const getIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.SALE: return <ShoppingBag className="text-emerald-500" />;
      case TransactionType.INVOICE_PAYMENT: return <FileText className="text-blue-500" />;
      case TransactionType.EXPENSE: 
      case TransactionType.RESTOCK: return <ArrowDownLeft className="text-rose-500" />;
      default: return <ArrowUpRight className="text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Financial Ledger</h1>
      
      <Card>
        <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex justify-between items-center rounded-t-xl">
            <h2 className="font-semibold text-slate-700">Recent Transactions</h2>
            <Button variant="ghost" size="sm" className="text-indigo-600 h-8">Export CSV</Button>
        </div>
        <div className="divide-y divide-slate-100">
          {transactions.map((t) => (
            <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full bg-slate-50 border border-slate-100`}>
                  {getIcon(t.type)}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{t.description}</p>
                  <p className="text-xs text-slate-400">{new Date(t.date).toLocaleString()} • ID: {t.id}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-lg ${t.amount >= 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                  {t.amount < 0 ? '-' : '+'}R{Math.abs(t.amount).toFixed(2)}
                </p>
                <p className="text-xs text-slate-400 uppercase">{t.type.replace('_', ' ')}</p>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
              <div className="p-8 text-center text-slate-400">No transactions recorded yet.</div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Transactions;
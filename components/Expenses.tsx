import React, { useState } from 'react';
import { useFinancials } from '../context/FinancialContext';
import { TransactionType } from '../types';
import { 
  Upload, 
  Plus, 
  Calendar, 
  Info,
  ChevronDown,
  Search,
  ArrowLeft
} from 'lucide-react';
import { Button, Input, Card, Label, Select } from './UI';

const Expenses: React.FC = () => {
  const { bankAccounts, customers, addTransaction, transactions } = useFinancials();
  const [view, setView] = useState<'list' | 'create'>('list');

  // Form State
  const [formData, setFormData] = useState({
      date: new Date().toISOString().split('T')[0],
      expenseCategory: '',
      amount: '',
      paidThrough: '',
      vendor: '',
      reference: '',
      notes: '',
      customerId: '',
      tags: ''
  });

  const expenseCategories = [
      'Advertising & Marketing',
      'Automobile Expense',
      'Consultant Expense',
      'Contract Assets',
      'Cost of Goods Sold',
      'Depreciation Expense',
      'IT and Computer Expenses',
      'Janitorial Expense',
      'Meals and Entertainment',
      'Office Supplies',
      'Rent Expense',
      'Repairs and Maintenance',
      'Salaries and Employee Wages',
      'Travel Expense',
      'Utilities'
  ];

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.amount || !formData.paidThrough || !formData.expenseCategory) return;

      addTransaction({
          id: `EXP-${Date.now()}`,
          date: new Date(formData.date).toISOString(),
          type: TransactionType.EXPENSE,
          amount: -Number(formData.amount),
          description: `${formData.expenseCategory} - ${formData.vendor || 'Unknown Vendor'}`,
          accountId: formData.paidThrough,
          vendor: formData.vendor,
          expenseCategory: formData.expenseCategory,
          referenceId: formData.reference,
          customerId: formData.customerId
      });
      
      setView('list');
      setFormData({
          date: new Date().toISOString().split('T')[0],
          expenseCategory: '',
          amount: '',
          paidThrough: '',
          vendor: '',
          reference: '',
          notes: '',
          customerId: '',
          tags: ''
      });
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      alert("File upload simulation: Receipt attached.");
  };

  if (view === 'list') {
      const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE || t.type === TransactionType.RESTOCK);
      
      return (
          <div className="space-y-6">
              <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-slate-800">Purchases & Expenses</h1>
                  <Button onClick={() => setView('create')} className="gap-2">
                      <Plus size={20} /> Record Expense
                  </Button>
              </div>

              <Card className="overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-200 p-4 grid grid-cols-12 gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <div className="col-span-2">Date</div>
                      <div className="col-span-4">Description / Vendor</div>
                      <div className="col-span-3">Category</div>
                      <div className="col-span-2">Reference #</div>
                      <div className="col-span-1 text-right">Amount</div>
                  </div>
                  <div className="divide-y divide-slate-100">
                      {expenses.map(exp => (
                          <div key={exp.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors">
                              <div className="col-span-2 text-sm text-slate-600">{new Date(exp.date).toLocaleDateString()}</div>
                              <div className="col-span-4">
                                  <p className="font-medium text-slate-800 text-sm truncate">{exp.vendor || exp.description}</p>
                              </div>
                              <div className="col-span-3 text-sm text-slate-600 truncate">
                                  {exp.expenseCategory || 'General Expense'}
                              </div>
                              <div className="col-span-2 text-sm text-slate-500 font-mono">
                                  {exp.referenceId || '-'}
                              </div>
                              <div className="col-span-1 text-right font-bold text-slate-800">
                                  R{Math.abs(exp.amount).toFixed(2)}
                              </div>
                          </div>
                      ))}
                      {expenses.length === 0 && (
                          <div className="p-8 text-center text-slate-400">
                              No expenses recorded yet.
                          </div>
                      )}
                  </div>
              </Card>
          </div>
      );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-200">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
             <Button variant="ghost" size="sm" onClick={() => setView('list')}><ArrowLeft size={18} /></Button>
             <div className="flex gap-6">
                 <button className="text-sm font-medium text-indigo-600 border-b-2 border-indigo-600 pb-4 -mb-4 px-1">Record Expense</button>
                 <button className="text-sm font-medium text-slate-500 hover:text-slate-800 pb-4 -mb-4 px-1">Bulk Add Expenses</button>
             </div>
        </div>

        <div className="flex gap-6">
            {/* Form Section */}
            <form onSubmit={handleSubmit} className="flex-1 space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 {/* Row 1 */}
                 <div className="grid grid-cols-12 gap-4 items-center">
                    <Label className="col-span-3 text-rose-500">Date*</Label>
                    <div className="col-span-6">
                        <Input 
                            type="date" 
                            required
                            value={formData.date}
                            onChange={e => setFormData({...formData, date: e.target.value})}
                        />
                    </div>
                 </div>

                 {/* Row 2 */}
                 <div className="grid grid-cols-12 gap-4 items-center">
                    <Label className="col-span-3 text-rose-500">Expense Account*</Label>
                    <div className="col-span-6">
                        <Select 
                            required
                            value={formData.expenseCategory}
                            onChange={e => setFormData({...formData, expenseCategory: e.target.value})}
                        >
                            <option value="">Select an account</option>
                            {expenseCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </Select>
                    </div>
                 </div>

                 {/* Row 3 */}
                 <div className="grid grid-cols-12 gap-4 items-center">
                    <Label className="col-span-3 text-rose-500">Amount*</Label>
                    <div className="col-span-6 flex gap-2">
                        <Select className="w-24 bg-slate-50" disabled defaultValue="ZAR">
                            <option value="ZAR">ZAR</option>
                        </Select>
                        <Input 
                            type="number" 
                            step="0.01"
                            min="0"
                            required
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={e => setFormData({...formData, amount: e.target.value})}
                        />
                    </div>
                 </div>

                 {/* Row 4 */}
                 <div className="grid grid-cols-12 gap-4 items-center">
                    <Label className="col-span-3 text-rose-500">Paid Through*</Label>
                    <div className="col-span-6">
                        <Select
                            required
                            value={formData.paidThrough}
                            onChange={e => setFormData({...formData, paidThrough: e.target.value})}
                        >
                            <option value="">Select Account</option>
                            {bankAccounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name} - {acc.currency}</option>
                            ))}
                        </Select>
                    </div>
                 </div>

                 {/* Row 5 */}
                 <div className="grid grid-cols-12 gap-4 items-center">
                    <Label className="col-span-3">Vendor</Label>
                    <div className="col-span-6 relative">
                        <Input 
                            placeholder="Select or Type Vendor Name"
                            value={formData.vendor}
                            onChange={e => setFormData({...formData, vendor: e.target.value})}
                        />
                        <Search className="absolute right-3 top-2.5 text-slate-400" size={16} />
                    </div>
                 </div>

                 {/* Row 6 */}
                 <div className="grid grid-cols-12 gap-4 items-center">
                    <Label className="col-span-3">Reference#</Label>
                    <div className="col-span-6">
                        <Input 
                             value={formData.reference}
                             onChange={e => setFormData({...formData, reference: e.target.value})}
                        />
                    </div>
                 </div>

                 {/* Row 7 */}
                 <div className="grid grid-cols-12 gap-4 items-start">
                    <Label className="col-span-3 pt-2">Notes</Label>
                    <div className="col-span-6">
                        <textarea 
                            className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            rows={3}
                            maxLength={500}
                            placeholder="Max. 500 characters"
                            value={formData.notes}
                            onChange={e => setFormData({...formData, notes: e.target.value})}
                        />
                    </div>
                 </div>

                 {/* Row 8 */}
                 <div className="grid grid-cols-12 gap-4 items-center">
                    <Label className="col-span-3">Customer Name</Label>
                    <div className="col-span-6 relative">
                         <Select
                            value={formData.customerId}
                            onChange={e => setFormData({...formData, customerId: e.target.value})}
                        >
                            <option value="">Select or add a customer</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </Select>
                    </div>
                 </div>

                 {/* Footer Actions */}
                 <div className="pt-6 border-t border-slate-100 flex gap-3">
                     <Button type="submit" variant="secondary" className="bg-emerald-500 hover:bg-emerald-600">Save</Button>
                     <Button type="button" variant="outline" onClick={() => setView('list')}>Cancel</Button>
                 </div>
            </form>

            {/* Upload Section */}
            <div className="w-80 space-y-4">
                 <div 
                    className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-slate-50 h-64 cursor-pointer hover:bg-slate-100 transition-colors"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                 >
                     <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-3">
                        <Upload size={24} />
                     </div>
                     <h3 className="text-sm font-semibold text-slate-800">Drag or Drop your Receipts</h3>
                     <p className="text-xs text-slate-500 mt-1 mb-4">Maximum file size allowed is 10MB</p>
                     
                     <Button size="sm" variant="outline" className="bg-white">Upload your Files</Button>
                 </div>
                 
                 <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg flex gap-3">
                     <Info className="text-amber-600 flex-shrink-0" size={18} />
                     <p className="text-xs text-amber-800">
                         <strong>Tip:</strong> You can create expense rules to categorize expenses automatically.
                     </p>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default Expenses;
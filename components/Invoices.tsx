import React, { useState, useEffect } from 'react';
import { useFinancials } from '../context/FinancialContext';
import { Invoice, InvoiceStatus, InvoiceItem, Product, RecurrenceInterval, Customer } from '../types';
import { Plus, Printer, Mail, CheckCircle, RefreshCcw, Calendar, Play, Trash2 } from 'lucide-react';
import { Button, Badge, Card, Modal, Input, Label, Select } from './UI';
import DocumentEditor from './DocumentEditor';

interface InvoicesProps {
  initialView?: 'standard' | 'recurring';
}

const Invoices: React.FC<InvoicesProps> = ({ initialView = 'standard' }) => {
  const { invoices, recurringTemplates, products, customers, createInvoice, updateInvoiceStatus, addRecurringTemplate, processRecurringInvoices } = useFinancials();
  const [view, setView] = useState<'list' | 'editor' | 'recurring'>('list');
  const [showRecurringModal, setShowRecurringModal] = useState(false);

  // Sync activeTab if initialView changes
  useEffect(() => {
    if (initialView === 'recurring') setView('recurring');
    else setView('list');
  }, [initialView]);

  const getStatusVariant = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID: return 'success';
      case InvoiceStatus.SENT: return 'default'; // blue-ish in default
      case InvoiceStatus.OVERDUE: return 'danger';
      default: return 'outline';
    }
  };

  if (view === 'editor') {
    return <DocumentEditor mode="INVOICE" onBack={() => setView('list')} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Invoices</h1>
        <div className="flex gap-2">
           <div className="bg-slate-100 p-1 rounded-lg flex">
              <button 
                onClick={() => setView('list')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${view === 'list' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                All Invoices
              </button>
              <button 
                onClick={() => setView('recurring')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${view === 'recurring' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Recurring
              </button>
           </div>
           
           {view === 'list' ? (
              <div className="flex gap-2">
                <Button 
                    onClick={() => setShowRecurringModal(true)} 
                    variant="outline" 
                    className="gap-2 text-purple-600 border-purple-200 hover:bg-purple-50 hidden sm:flex"
                >
                    <RefreshCcw size={18} /> Setup Recurring
                </Button>
                <Button onClick={() => setView('editor')} className="gap-2 shadow-lg shadow-indigo-200">
                    <Plus size={18} /> Create Invoice
                </Button>
              </div>
           ) : (
              <Button onClick={() => setShowRecurringModal(true)} className="gap-2 bg-purple-600 hover:bg-purple-700">
                <RefreshCcw size={18} /> New Recurring
              </Button>
           )}
        </div>
      </div>

      {view === 'list' ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-200">
                <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice ID</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{invoice.id}</td>
                    <td className="px-6 py-4 text-slate-600">
                        <div className="font-medium text-slate-800">{invoice.customerName}</div>
                        <div className="text-xs text-slate-400">{invoice.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{invoice.date}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">R{invoice.total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                        <Badge variant={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                        {invoice.status !== InvoiceStatus.PAID && (
                            <Button 
                                size="icon" variant="ghost" 
                                onClick={() => updateInvoiceStatus(invoice.id, InvoiceStatus.PAID)}
                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                title="Mark as Paid"
                            >
                                <CheckCircle size={18} />
                            </Button>
                        )}
                        <Button size="icon" variant="ghost"><Printer size={18} /></Button>
                        <Button size="icon" variant="ghost"><Mail size={18} /></Button>
                        </div>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
          {invoices.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              No invoices found. Create one to get started.
            </div>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
           {/* Recurring Invoices Toolbar */}
           <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex justify-between items-center">
              <div className="text-purple-800">
                 <h3 className="font-bold flex items-center gap-2"><Calendar size={20} /> Recurring Manager</h3>
                 <p className="text-sm opacity-80">Automate your billing for retainers and subscriptions.</p>
              </div>
              <Button onClick={processRecurringInvoices} className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                 <Play size={18} /> Run Due Invoices
              </Button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recurringTemplates.map(template => (
                 <Card key={template.id} className="relative p-6">
                    <div className="absolute top-4 right-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                       {template.interval}
                    </div>
                    <div className="mb-4">
                       <h3 className="font-bold text-slate-800 text-lg">{template.customerName}</h3>
                       <p className="text-sm text-slate-500">{template.customerEmail}</p>
                    </div>
                    <div className="space-y-2 mb-4">
                       {template.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                             <span className="text-slate-600">{item.description} (x{item.quantity})</span>
                             <span className="font-medium">R{item.total.toFixed(2)}</span>
                          </div>
                       ))}
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                       <div className="text-xs text-slate-500">
                          Next Run: <span className="font-semibold text-slate-700">{template.nextDueDate}</span>
                       </div>
                       <Badge variant="success">ACTIVE</Badge>
                    </div>
                 </Card>
              ))}
           </div>
        </div>
      )}
      
      <CreateRecurringModal
        isOpen={showRecurringModal}
        products={products}
        customers={customers}
        onClose={() => setShowRecurringModal(false)}
        onCreate={addRecurringTemplate}
      />
    </div>
  );
};

const CreateRecurringModal: React.FC<{
   isOpen: boolean;
   products: Product[];
   customers: Customer[];
   onClose: () => void;
   onCreate: (template: any) => void;
 }> = ({ isOpen, products, customers, onClose, onCreate }) => {
   const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
   const [interval, setInterval] = useState<RecurrenceInterval>('MONTHLY');
   const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
   const [items, setItems] = useState<InvoiceItem[]>([]);
   
   const addItem = (productId: string) => {
     const product = products.find(p => p.id === productId);
     if (!product) return;
     setItems(prev => [...prev, {
       id: Date.now().toString(),
       productId: product.id,
       description: product.name,
       quantity: 1,
       unitPrice: product.price,
       total: product.price
     }]);
   };
 
   const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
     setItems(prev => prev.map(item => {
       if (item.id === id) {
         const updated = { ...item, [field]: value };
         if (field === 'quantity' || field === 'unitPrice') updated.total = updated.quantity * updated.unitPrice;
         return updated;
       }
       return item;
     }));
   };

   const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
 
   const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     if(!selectedCustomer) return;
     onCreate({
       id: `REC-${Date.now()}`,
       customerId: selectedCustomer.id,
       customerName: selectedCustomer.name,
       customerEmail: selectedCustomer.email,
       items,
       interval,
       nextDueDate: startDate,
       active: true
     });
     onClose();
   };
 
   return (
    <Modal isOpen={isOpen} onClose={onClose} title="Setup Recurring Invoice" className="max-w-3xl">
         <form onSubmit={handleSubmit} className="space-y-6">
           <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <Label>Customer</Label>
                  <Select required onChange={(e) => setSelectedCustomer(customers.find(c => c.id === e.target.value) || null)}>
                     <option value="">Select Customer...</option>
                     {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Select>
               </div>
               <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                     <Label>Interval</Label>
                     <Select value={interval} onChange={(e) => setInterval(e.target.value as any)}>
                        <option value="WEEKLY">Weekly</option>
                        <option value="MONTHLY">Monthly</option>
                        <option value="ANNUALLY">Annually</option>
                     </Select>
                  </div>
                  <div className="space-y-2">
                     <Label>Start Date</Label>
                     <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                  </div>
               </div>
           </div>
 
           <div className="space-y-2">
             <Label>Recurring Items</Label>
             <Select className="mb-4" onChange={(e) => { if(e.target.value) addItem(e.target.value); e.target.value = ''; }}>
               <option value="">Add product...</option>
               {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
             </Select>
             <div className="space-y-3">
               {items.map(item => (
                 <div key={item.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                   <Input className="flex-1 border-none bg-transparent shadow-none" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} />
                   <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">Qty:</span>
                      <Input type="number" className="w-16 h-8 text-center" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))} />
                   </div>
                   <div className="w-20 font-bold text-right">R{item.total.toFixed(2)}</div>
                   <Button size="icon" variant="ghost" type="button" onClick={() => removeItem(item.id)} className="text-rose-500 hover:text-rose-700 hover:bg-rose-50"><Trash2 size={16} /></Button>
                 </div>
               ))}
             </div>
           </div>
 
           <div className="flex justify-end gap-3 pt-4">
             <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
             <Button type="submit" className="bg-purple-600 hover:bg-purple-700">Save Schedule</Button>
           </div>
         </form>
    </Modal>
   );
 };

export default Invoices;
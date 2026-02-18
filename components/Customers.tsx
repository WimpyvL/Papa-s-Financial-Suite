import React, { useState } from 'react';
import { useFinancials } from '../context/FinancialContext';
import { Customer } from '../types';
import { Search, Plus, Phone, Mail, MapPin, User, FileText, CheckCircle, Save } from 'lucide-react';
import { Card, Button, Input, Modal, Label } from './UI';

const Customers: React.FC = () => {
  const { customers, addCustomer, updateCustomer, invoices } = useFinancials();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  
  const customerInvoices = invoices.filter(inv => inv.customerName === selectedCustomer?.name || inv.customerId === selectedCustomer?.id);
  const totalSpend = customerInvoices.reduce((sum, inv) => sum + inv.total, 0);

  return (
    <div className="flex h-[calc(100vh-2rem)] gap-6">
      {/* Customer List */}
      <Card className="w-1/3 flex flex-col overflow-hidden border-slate-200">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <h2 className="font-bold text-slate-800">Customers</h2>
          <Button size="icon" variant="primary" onClick={() => setShowAddModal(true)} className="h-8 w-8">
            <Plus size={16} />
          </Button>
        </div>
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <Input 
              placeholder="Search customers..." 
              className="pl-9"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredCustomers.map(customer => (
             <div 
               key={customer.id} 
               onClick={() => setSelectedCustomerId(customer.id)}
               className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${selectedCustomerId === customer.id ? 'bg-indigo-50/50 border-indigo-100' : ''}`}
             >
                <div className="font-semibold text-slate-800">{customer.name}</div>
                <div className="text-xs text-slate-500 truncate">{customer.email}</div>
             </div>
          ))}
        </div>
      </Card>

      {/* Customer Detail */}
      <Card className="flex-1 overflow-hidden flex flex-col border-slate-200">
        {selectedCustomer ? (
          <>
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                  <User size={32} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{selectedCustomer.name}</h1>
                  <p className="text-slate-500 text-sm">Customer ID: {selectedCustomer.id}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Lifetime Spend</p>
                <p className="text-2xl font-bold text-emerald-600">R{totalSpend.toFixed(2)}</p>
              </div>
            </div>

            <div className="p-6 grid grid-cols-2 gap-8">
               <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800 border-b pb-2">Contact Details</h3>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Mail size={18} /> <span>{selectedCustomer.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Phone size={18} /> <span>{selectedCustomer.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <MapPin size={18} /> <span>{selectedCustomer.address || 'N/A'}</span>
                  </div>
               </div>
               
               <div className="flex flex-col h-full">
                 <div className="flex justify-between items-center border-b pb-2 mb-2">
                    <h3 className="font-semibold text-slate-800">Internal Notes</h3>
                    <span className="text-xs text-emerald-600 flex items-center gap-1">
                      <CheckCircle size={12} /> Auto-saved
                    </span>
                 </div>
                 <textarea 
                   className="w-full h-32 p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-yellow-50/30 resize-none"
                   placeholder="Add notes about preferences, interactions, or special requirements..."
                   value={selectedCustomer.notes || ''}
                   onChange={(e) => updateCustomer(selectedCustomer.id, { notes: e.target.value })}
                 />
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 border-t border-slate-200">
               <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                 <FileText size={18} /> Order History
               </h3>
               {customerInvoices.length > 0 ? (
                 <div className="space-y-3">
                   {customerInvoices.map(inv => (
                     <Card key={inv.id} className="p-4 flex justify-between items-center hover:shadow-md transition-shadow">
                       <div>
                         <p className="font-bold text-slate-700">{inv.id}</p>
                         <p className="text-xs text-slate-500">{inv.date}</p>
                       </div>
                       <div className="text-right">
                         <p className="font-bold text-slate-800">R{inv.total.toFixed(2)}</p>
                         <span className={`text-xs px-2 py-0.5 rounded-full ${inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}`}>
                           {inv.status}
                         </span>
                       </div>
                     </Card>
                   ))}
                 </div>
               ) : (
                 <p className="text-slate-400 italic">No previous orders found.</p>
               )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <User size={64} className="mb-4 opacity-20" />
            <p>Select a customer to view details</p>
          </div>
        )}
      </Card>

      <AddCustomerModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={addCustomer} />
    </div>
  );
};

const AddCustomerModal: React.FC<{ isOpen: boolean; onClose: () => void, onAdd: (c: Customer) => void }> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', notes: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: `CUST-${Date.now()}`,
      ...formData
    });
    onClose();
    setFormData({ name: '', email: '', phone: '', address: '', notes: '' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Customer">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <textarea className="w-full border border-slate-200 p-2 rounded-lg text-sm" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Add Customer</Button>
          </div>
        </form>
    </Modal>
  );
};

export default Customers;
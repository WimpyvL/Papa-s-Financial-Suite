import React, { useState, useEffect } from 'react';
import { useFinancials } from '../context/FinancialContext';
import { Invoice, InvoiceItem, InvoiceStatus, InvoiceDesign, Product, Job } from '../types';
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Palette, 
  FileText, 
  Trash2, 
  Plus, 
  LayoutTemplate,
  Type,
  Image as ImageIcon,
  Printer
} from 'lucide-react';
import { Button, Input, Label, Select, Card, Textarea } from './UI';

interface DocumentEditorProps {
  onBack: () => void;
  mode: 'INVOICE' | 'QUOTE';
  initialData?: Invoice | Job | null;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({ onBack, mode, initialData }) => {
  const { customers, products, createInvoice, invoiceDesign, updateInvoiceDesign, updateJob } = useFinancials();
  
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');
  
  // Document State
  const [docData, setDocData] = useState<any>({
    id: mode === 'INVOICE' ? `INV-${Date.now().toString().slice(-6)}` : `QUO-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    items: [],
    notes: ''
  });
  
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');

  // Initialize Data
  useEffect(() => {
    if (initialData) {
        if (mode === 'INVOICE') {
            const inv = initialData as Invoice;
            setDocData(inv);
            setSelectedCustomer(inv.customerId || '');
        } else {
            const job = initialData as Job;
            // Map Job to Document Structure
            setDocData({
                id: job.id,
                date: job.startDate,
                dueDate: job.deadline || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0], // Quote expiry
                items: job.items || [{ id: '1', description: job.description, quantity: 1, unitPrice: job.quoteTotal, total: job.quoteTotal }],
                notes: job.notes || '',
                customerId: job.clientId,
                customerName: job.clientName,
                // Job doesn't have email in interface, fetch from customer list
            });
            setSelectedCustomer(job.clientId);
        }
    }
  }, [initialData, mode]);

  // Calculations
  const subtotal = docData.items?.reduce((sum: number, i: any) => sum + i.total, 0) || 0;
  const tax = subtotal * 0.15; // 15% VAT
  const total = subtotal + tax;

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const custId = e.target.value;
    setSelectedCustomer(custId);
    const customer = customers.find(c => c.id === custId);
    if (customer) {
      setDocData((prev: any) => ({
        ...prev,
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email
      }));
    }
  };

  const addItem = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      productId: product.id,
      description: product.name,
      quantity: 1,
      unitPrice: product.price,
      total: product.price
    };
    setDocData((prev: any) => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setDocData((prev: any) => ({
      ...prev,
      items: prev.items?.map((item: any) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updated.total = updated.quantity * updated.unitPrice;
          }
          return updated;
        }
        return item;
      })
    }));
  };

  const removeItem = (id: string) => {
    setDocData((prev: any) => ({
      ...prev,
      items: prev.items?.filter((i: any) => i.id !== id)
    }));
  };

  const handleSave = () => {
    if (!docData.customerName) {
      alert("Please select a customer.");
      return;
    }
    
    if (mode === 'INVOICE') {
        const finalInvoice: Invoice = {
            ...docData,
            subtotal,
            tax,
            total,
            status: InvoiceStatus.SENT 
        };
        createInvoice(finalInvoice);
    } else {
        // Update Job
        if (initialData && (initialData as Job).id) {
             updateJob((initialData as Job).id, {
                 items: docData.items,
                 quoteTotal: subtotal // Assuming quote total is pre-tax or post-tax? Usually total.
             });
             alert("Quote updated in Job.");
        } else {
            alert("To create a new Quote, please start from the Jobs section.");
        }
    }
    onBack();
  };

  return (
    <div className="flex h-[calc(100vh-2rem)] bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
      
      {/* LEFT PANEL: Editor */}
      <div className="w-[450px] flex flex-col bg-white border-r border-slate-200 z-10 shadow-xl">
        {/* Toolbar */}
        <div className="h-16 border-b border-slate-100 flex items-center px-4 justify-between bg-white">
           <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full hover:bg-slate-100">
                  <ArrowLeft size={18} />
              </Button>
              <h2 className="font-bold text-slate-800">{mode === 'INVOICE' ? 'Invoice' : 'Quote'} Editor</h2>
           </div>
           <Button onClick={handleSave} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-sm">
              <Save size={16} /> Save
           </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
            <button 
                onClick={() => setActiveTab('content')}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'content' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                <FileText size={16} /> Content
            </button>
            <button 
                onClick={() => setActiveTab('design')}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'design' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                <Palette size={16} /> Design
            </button>
        </div>

        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
            {activeTab === 'content' ? (
                <div className="space-y-6 animate-in slide-in-from-left-2 duration-200">
                    {/* Meta */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label>{mode === 'INVOICE' ? 'Invoice #' : 'Quote #'}</Label>
                                <Input value={docData.id} onChange={e => setDocData({...docData, id: e.target.value})} className="font-mono bg-slate-50" />
                            </div>
                            <div className="space-y-1">
                                <Label>Customer</Label>
                                <Select value={selectedCustomer} onChange={handleCustomerChange} className="bg-slate-50">
                                    <option value="">Select Customer</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label>Issue Date</Label>
                                <Input type="date" value={docData.date} onChange={e => setDocData({...docData, date: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <Label>{mode === 'INVOICE' ? 'Due Date' : 'Valid Until'}</Label>
                                <Input type="date" value={docData.dueDate} onChange={e => setDocData({...docData, dueDate: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <Label className="text-slate-500 uppercase text-xs font-bold tracking-wider">Line Items</Label>
                        </div>
                        
                        <Select 
                            className="bg-white mb-2" 
                            onChange={(e) => { if(e.target.value) addItem(e.target.value); e.target.value=''; }}
                        >
                            <option value="">+ Add Product Line</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </Select>

                        {docData.items?.map((item: any) => (
                            <div key={item.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm relative group">
                                <button onClick={() => removeItem(item.id)} className="absolute top-2 right-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                                    <Trash2 size={14} />
                                </button>
                                <div className="space-y-2 pr-6">
                                    <Input 
                                        value={item.description} 
                                        onChange={e => updateItem(item.id, 'description', e.target.value)} 
                                        className="border-transparent bg-transparent p-0 h-auto font-medium focus:ring-0 placeholder:text-slate-300"
                                        placeholder="Item Description"
                                    />
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <Label className="text-[10px]">Qty</Label>
                                            <Input 
                                                type="number" className="h-8" 
                                                value={item.quantity} onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))} 
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <Label className="text-[10px]">Price</Label>
                                            <Input 
                                                type="number" className="h-8" 
                                                value={item.unitPrice} onChange={e => updateItem(item.id, 'unitPrice', Number(e.target.value))} 
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <Label className="text-[10px]">Total</Label>
                                            <div className="h-8 flex items-center text-sm font-bold text-slate-700 bg-slate-50 px-2 rounded border border-slate-100">
                                                {item.total.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer Notes */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                         <Label>Notes / Terms</Label>
                         <Textarea 
                            rows={3} 
                            value={docData.notes} 
                            onChange={e => setDocData({...docData, notes: e.target.value})}
                            placeholder="Terms and conditions..."
                            className="bg-slate-50 border-slate-200"
                         />
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-in slide-in-from-right-2 duration-200">
                    {/* Branding */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                            <ImageIcon size={16} /> Branding
                        </h3>
                        <div className="space-y-2">
                            <Label>Primary Color</Label>
                            <div className="flex gap-2 items-center">
                                <input 
                                    type="color" 
                                    value={invoiceDesign.primaryColor}
                                    onChange={e => updateInvoiceDesign({ primaryColor: e.target.value })}
                                    className="h-10 w-10 rounded border border-slate-200 cursor-pointer"
                                />
                                <Input 
                                    value={invoiceDesign.primaryColor} 
                                    onChange={e => updateInvoiceDesign({ primaryColor: e.target.value })}
                                    className="font-mono uppercase"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Font</Label>
                            <div className="flex gap-2">
                                {['Inter', 'Serif', 'Mono'].map(f => (
                                    <button 
                                        key={f}
                                        onClick={() => updateInvoiceDesign({ font: f as any })}
                                        className={`flex-1 py-2 text-xs border rounded-md transition-all ${invoiceDesign.font === f ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold' : 'border-slate-200 text-slate-600'}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Template Selection */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                         <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                            <LayoutTemplate size={16} /> Visual Template
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                             {['modern', 'classic', 'minimal', 'bold', 'corporate'].map(t => (
                                 <button
                                    key={t}
                                    onClick={() => updateInvoiceDesign({ template: t as any })}
                                    className={`px-3 py-2 rounded-lg border text-sm capitalize transition-all ${invoiceDesign.template === t ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                 >
                                     {t}
                                 </button>
                             ))}
                        </div>
                    </div>

                    {/* Business Info */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                            <Type size={16} /> Business Details
                        </h3>
                        <div className="space-y-1">
                            <Label>Company Name</Label>
                            <Input value={invoiceDesign.businessName} onChange={e => updateInvoiceDesign({ businessName: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <Label>Address</Label>
                            <Input value={invoiceDesign.businessAddress} onChange={e => updateInvoiceDesign({ businessAddress: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <Label>Email</Label>
                            <Input value={invoiceDesign.businessEmail} onChange={e => updateInvoiceDesign({ businessEmail: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <Label>Footer Message</Label>
                            <Textarea value={invoiceDesign.footerText} onChange={e => updateInvoiceDesign({ footerText: e.target.value })} className="h-16" />
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* RIGHT PANEL: Live Preview */}
      <div className="flex-1 bg-slate-200 p-8 overflow-y-auto flex items-start justify-center">
         {/* A4 Paper Container */}
         <div 
            className="w-[210mm] min-h-[297mm] bg-white shadow-2xl transition-all duration-300 flex flex-col relative"
            style={{ 
                fontFamily: invoiceDesign.font === 'Mono' ? 'monospace' : invoiceDesign.font === 'Serif' ? 'serif' : 'Inter, sans-serif' 
            }}
         >
             <div className="absolute top-0 right-0 p-4 print:hidden">
                 <Button size="sm" variant="outline" onClick={() => window.print()} className="gap-2 bg-white/80 backdrop-blur">
                     <Printer size={16} /> Print
                 </Button>
             </div>

             {/* Dynamic Template Rendering */}
             {invoiceDesign.template === 'modern' && (
                 <>
                    <div className="h-4 w-full" style={{ backgroundColor: invoiceDesign.primaryColor }}></div>
                    <div className="p-12 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <div className="text-3xl font-bold text-slate-800 tracking-tight">{invoiceDesign.businessName}</div>
                                <div className="text-sm text-slate-500 mt-2 max-w-[200px]">
                                    {invoiceDesign.businessAddress}<br/>
                                    {invoiceDesign.businessEmail}<br/>
                                    {invoiceDesign.businessPhone}
                                </div>
                            </div>
                            <div className="text-right">
                                <h1 className="text-5xl font-black tracking-tighter uppercase" style={{ color: invoiceDesign.primaryColor }}>{mode}</h1>
                                <div className="mt-4 text-slate-600">
                                    <p className="font-bold">#{docData.id}</p>
                                    <p>{docData.date}</p>
                                </div>
                            </div>
                        </div>
                        <StandardBody docData={docData} invoiceDesign={invoiceDesign} subtotal={subtotal} tax={tax} total={total} />
                    </div>
                 </>
             )}

             {invoiceDesign.template === 'classic' && (
                 <div className="p-12 flex-1 flex flex-col border-t-8" style={{ borderColor: invoiceDesign.primaryColor }}>
                     <div className="text-center mb-12">
                         <h1 className="text-3xl font-serif font-bold text-slate-800 mb-2">{invoiceDesign.businessName}</h1>
                         <p className="text-sm text-slate-500">{invoiceDesign.businessAddress} • {invoiceDesign.businessPhone}</p>
                     </div>
                     <div className="flex justify-between items-center border-y border-slate-200 py-6 mb-8">
                         <div>
                             <span className="block text-xs font-bold uppercase text-slate-400 mb-1">To</span>
                             <span className="font-bold text-slate-800">{docData.customerName || 'Client Name'}</span>
                         </div>
                         <div className="text-right">
                             <span className="block text-xs font-bold uppercase text-slate-400 mb-1">{mode} #{docData.id}</span>
                             <span className="font-bold text-slate-800">{docData.date}</span>
                         </div>
                     </div>
                     <StandardBody docData={docData} invoiceDesign={invoiceDesign} subtotal={subtotal} tax={tax} total={total} simple />
                 </div>
             )}

             {invoiceDesign.template === 'minimal' && (
                 <div className="p-16 flex-1 flex flex-col font-sans">
                     <div className="mb-16">
                         <h1 className="text-6xl font-light text-slate-900 mb-4 capitalize">{mode.toLowerCase()}.</h1>
                         <div className="flex gap-12 text-sm">
                             <div>
                                 <span className="block text-slate-400 mb-1">From</span>
                                 <span className="font-medium text-slate-800">{invoiceDesign.businessName}</span>
                             </div>
                             <div>
                                 <span className="block text-slate-400 mb-1">To</span>
                                 <span className="font-medium text-slate-800">{docData.customerName || 'Client'}</span>
                             </div>
                         </div>
                     </div>
                     <StandardBody docData={docData} invoiceDesign={invoiceDesign} subtotal={subtotal} tax={tax} total={total} minimal />
                 </div>
             )}

             {invoiceDesign.template === 'bold' && (
                 <div className="flex-1 flex flex-col">
                     <div className="p-12 text-white" style={{ backgroundColor: invoiceDesign.primaryColor }}>
                         <div className="flex justify-between items-start">
                             <h1 className="text-6xl font-black tracking-tighter uppercase opacity-90">{mode}</h1>
                             <div className="text-right">
                                 <h2 className="text-2xl font-bold">{invoiceDesign.businessName}</h2>
                                 <p className="opacity-80 text-sm mt-1">{invoiceDesign.businessEmail}</p>
                             </div>
                         </div>
                         <div className="mt-12 flex gap-12 border-t border-white/20 pt-6">
                            <div>
                                <p className="text-xs uppercase tracking-wider opacity-60 mb-1">Billed To</p>
                                <p className="font-bold text-lg">{docData.customerName || 'Client Name'}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wider opacity-60 mb-1">Date</p>
                                <p className="font-bold text-lg">{docData.date}</p>
                            </div>
                             <div>
                                <p className="text-xs uppercase tracking-wider opacity-60 mb-1">Ref</p>
                                <p className="font-bold text-lg">#{docData.id}</p>
                            </div>
                         </div>
                     </div>
                     <div className="p-12 flex-1">
                        <StandardBody docData={docData} invoiceDesign={invoiceDesign} subtotal={subtotal} tax={tax} total={total} />
                     </div>
                 </div>
             )}

             {invoiceDesign.template === 'corporate' && (
                 <div className="flex-1 flex flex-row h-full">
                     <div className="w-64 bg-slate-100 p-8 flex flex-col border-r border-slate-200">
                         <h1 className="text-xl font-bold text-slate-800 mb-8">{invoiceDesign.businessName}</h1>
                         
                         <div className="space-y-6 text-sm text-slate-600">
                             <div>
                                 <p className="font-bold text-slate-900 mb-1">Our Info</p>
                                 <p>{invoiceDesign.businessAddress}</p>
                                 <p>{invoiceDesign.businessPhone}</p>
                                 <p>{invoiceDesign.businessEmail}</p>
                             </div>
                             <div>
                                 <p className="font-bold text-slate-900 mb-1">Bill To</p>
                                 <p>{docData.customerName || 'Client Name'}</p>
                                 <p>{docData.customerEmail}</p>
                             </div>
                             <div>
                                 <p className="font-bold text-slate-900 mb-1">{mode} Details</p>
                                 <p>#{docData.id}</p>
                                 <p>{docData.date}</p>
                             </div>
                         </div>
                         
                         <div className="mt-auto text-xs text-slate-400">
                             <p>{invoiceDesign.footerText}</p>
                         </div>
                     </div>
                     <div className="flex-1 p-12">
                         <h1 className="text-4xl font-light text-slate-300 mb-12 uppercase tracking-widest">{mode}</h1>
                         <StandardBody docData={docData} invoiceDesign={invoiceDesign} subtotal={subtotal} tax={tax} total={total} simple />
                     </div>
                 </div>
             )}

         </div>
      </div>
    </div>
  );
};

const StandardBody = ({ docData, invoiceDesign, subtotal, tax, total, simple, minimal }: any) => {
    return (
        <div className="flex-1 flex flex-col">
            {!minimal && (
                <div className="flex-1">
                    <table className="w-full text-left">
                        <thead>
                            <tr className={simple ? "border-b-2 border-slate-200" : "border-b-2"} style={!simple ? { borderColor: invoiceDesign.primaryColor } : {}}>
                                <th className="py-3 text-sm font-bold uppercase text-slate-600">Description</th>
                                <th className="py-3 text-sm font-bold uppercase text-slate-600 text-right w-20">Qty</th>
                                <th className="py-3 text-sm font-bold uppercase text-slate-600 text-right w-32">Price</th>
                                <th className="py-3 text-sm font-bold uppercase text-slate-600 text-right w-32">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(docData.items && docData.items.length > 0 ? docData.items : [{id:'demo', description: 'Sample Item', quantity: 1, unitPrice: 0, total: 0}]).map((item: any, i: number) => (
                                <tr key={i}>
                                    <td className="py-4 text-slate-800">{item.description}</td>
                                    <td className="py-4 text-slate-600 text-right">{item.quantity}</td>
                                    <td className="py-4 text-slate-600 text-right">R{item.unitPrice.toFixed(2)}</td>
                                    <td className="py-4 font-bold text-slate-800 text-right">R{item.total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {minimal && (
                <div className="flex-1">
                    {(docData.items && docData.items.length > 0 ? docData.items : [{id:'demo', description: 'Sample Item', quantity: 1, unitPrice: 0, total: 0}]).map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-baseline py-4 border-b border-slate-100">
                            <div>
                                <p className="text-lg font-medium text-slate-800">{item.description}</p>
                                <p className="text-sm text-slate-400">{item.quantity} x R{item.unitPrice.toFixed(2)}</p>
                            </div>
                            <div className="text-lg font-bold text-slate-900">R{item.total.toFixed(2)}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Totals */}
            <div className="flex justify-end mt-8 pt-8 border-t border-slate-100">
                <div className="w-64 space-y-3">
                    <div className="flex justify-between text-slate-500">
                        <span>Subtotal</span>
                        <span>R{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                        <span>Tax (15%)</span>
                        <span>R{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-2xl font-bold" style={{ color: invoiceDesign.primaryColor }}>
                        <span>Total</span>
                        <span>R{total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            {!minimal && (
                <div className="mt-auto pt-12 text-center text-sm text-slate-400">
                    {invoiceDesign.footerText}
                </div>
            )}
        </div>
    );
};

export default DocumentEditor;
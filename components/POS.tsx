import React, { useState, useMemo } from 'react';
import { useFinancials } from '../context/FinancialContext';
import { CartItem, Product, Customer } from '../types';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, ShoppingCart, User, PauseCircle, PlayCircle, X, Check, Save } from 'lucide-react';
import { Button, Input, Card, Badge, Modal, Label, Select } from './UI';

const POS: React.FC = () => {
  const { products, processSale, customers, parkSale, heldSales, discardHeldSale } = useFinancials();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Transaction State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [discount, setDiscount] = useState<number>(0);
  const [note, setNote] = useState('');
  
  // Modal States
  const [showCheckout, setShowCheckout] = useState(false);
  const [showHeldOrders, setShowHeldOrders] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  
  // Checkout Details
  const [lastTransaction, setLastTransaction] = useState<any>(null);

  // Derived Data
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    if(window.confirm("Clear current cart?")) {
      setCart([]);
      setSelectedCustomer(null);
      setDiscount(0);
      setNote('');
    }
  };

  const handleParkOrder = () => {
    if (cart.length === 0) return;
    parkSale(cart, selectedCustomer, note || 'Parked order');
    setCart([]);
    setSelectedCustomer(null);
    setDiscount(0);
    setNote('');
    alert("Order parked successfully.");
  };

  const restoreHeldOrder = (sale: any) => {
    setCart(sale.items);
    setSelectedCustomer(sale.customer);
    setNote(sale.note);
    discardHeldSale(sale.id);
    setShowHeldOrders(false);
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.10; // 10% Tax
  const total = subtotal + tax - discount;

  return (
    <div className="flex h-[calc(100vh-2rem)] gap-4">
      {/* LEFT: Product Selection */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Header / Filter Bar */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex gap-3 items-center">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <Input 
                    placeholder="Scan or Search products..."
                    className="pl-9 h-10"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-[50%]">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                            selectedCategory === cat 
                            ? 'bg-indigo-600 text-white shadow-md' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-2">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                {filteredProducts.map(product => (
                    <button 
                        key={product.id}
                        onClick={() => addToCart(product)}
                        disabled={product.category !== 'Service' && product.stock <= 0}
                        className={`relative p-4 bg-white rounded-xl border text-left transition-all duration-200 group flex flex-col justify-between min-h-[140px] ${
                        product.stock <= 0 && product.category !== 'Service' 
                            ? 'opacity-60 cursor-not-allowed border-slate-100' 
                            : 'border-slate-200 hover:border-indigo-400 hover:shadow-md hover:-translate-y-1'
                        }`}
                    >
                        {product.stock <= 5 && product.category !== 'Service' && (
                           <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                        )}
                        <div>
                            <h3 className="font-semibold text-slate-800 text-sm leading-tight line-clamp-2">{product.name}</h3>
                            <p className="text-xs text-slate-500 mt-1">{product.category}</p>
                        </div>
                        <div className="mt-3">
                            <span className="block text-lg font-bold text-indigo-600">R{product.price.toFixed(0)}</span>
                            {product.category !== 'Service' && (
                                <span className={`text-[10px] uppercase font-bold tracking-wider ${product.stock < 10 ? 'text-orange-600' : 'text-slate-400'}`}>
                                    {product.stock} {product.unit} left
                                </span>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* RIGHT: Transaction Cart */}
      <Card className="w-[400px] flex flex-col h-full border-slate-200 shadow-xl overflow-hidden bg-slate-50/50">
        {/* Cart Header */}
        <div className="p-4 bg-white border-b border-slate-200 shadow-sm z-10">
            <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                    <ShoppingCart size={18} /> Current Sale
                </h2>
                <div className="flex gap-1">
                    <Button 
                        size="sm" variant="outline" 
                        onClick={() => setShowHeldOrders(true)}
                        className="h-8 px-2 text-xs"
                    >
                        <PauseCircle size={14} className="mr-1" /> Orders ({heldSales.length})
                    </Button>
                    <Button 
                        size="sm" variant="ghost" 
                        onClick={clearCart}
                        disabled={cart.length === 0}
                        className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            </div>
            
            {/* Customer Selector */}
            <div className="relative">
                <select 
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer hover:bg-white transition-colors"
                    value={selectedCustomer?.id || ''}
                    onChange={(e) => setSelectedCustomer(customers.find(c => c.id === e.target.value) || null)}
                >
                    <option value="">Select Customer (Optional)</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <User className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" size={16} />
            </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2 opacity-60">
                    <ShoppingCart size={48} />
                    <p className="text-sm font-medium">Cart is empty</p>
                    <p className="text-xs">Select products to start</p>
                </div>
            ) : (
                cart.map(item => (
                    <div key={item.id} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex items-center gap-3 group">
                        <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-800 text-sm truncate" title={item.name}>{item.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                <span>R{item.price}</span>
                                <span>•</span>
                                <span>{item.unit}</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center bg-slate-100 rounded-md">
                            <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded-l-md transition-colors">
                                <Minus size={12} />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded-r-md transition-colors">
                                <Plus size={12} />
                            </button>
                        </div>
                        
                        <div className="text-right min-w-[60px]">
                            <div className="font-bold text-slate-800 text-sm">R{(item.price * item.quantity).toFixed(0)}</div>
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* Totals Section */}
        <div className="bg-white border-t border-slate-200 p-4 space-y-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>R{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                    <span>Discount</span>
                    <div className="flex items-center gap-1 w-24">
                        <span className="text-slate-400">-R</span>
                        <input 
                            type="number" 
                            className="w-full bg-slate-50 border-none p-1 text-right rounded focus:ring-1 focus:ring-indigo-500 text-slate-700" 
                            value={discount} 
                            onChange={(e) => setDiscount(Number(e.target.value))}
                            min="0"
                        />
                    </div>
                </div>
                <div className="flex justify-between text-slate-500">
                    <span>Tax (10%)</span>
                    <span>R{tax.toFixed(2)}</span>
                </div>
            </div>
            
            <div className="flex justify-between items-end pt-2 border-t border-dashed border-slate-200">
                <span className="text-slate-500 font-medium">Total Payable</span>
                <span className="text-2xl font-black text-indigo-900">R{total.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-2">
                <Button 
                    variant="outline" 
                    className="col-span-1 border-slate-300 text-slate-600"
                    disabled={cart.length === 0}
                    onClick={handleParkOrder}
                    title="Park Order"
                >
                    <PauseCircle size={20} />
                </Button>
                <Button 
                    variant="primary" 
                    className="col-span-3 h-12 text-lg shadow-indigo-200"
                    disabled={cart.length === 0}
                    onClick={() => setShowCheckout(true)}
                >
                    Checkout <Banknote className="ml-2" size={20} />
                </Button>
            </div>
        </div>
      </Card>

      {/* Modals */}
      <CheckoutModal 
        isOpen={showCheckout} 
        onClose={() => setShowCheckout(false)} 
        total={total}
        onComplete={(method, tendered, change) => {
            const saleSummary = {
                items: [...cart],
                customer: selectedCustomer,
                total,
                subtotal,
                discount,
                tax,
                method,
                tendered,
                change,
                date: new Date().toLocaleString()
            };
            
            processSale(cart, total, method, selectedCustomer?.id);
            setLastTransaction(saleSummary);
            
            // Reset
            setCart([]);
            setSelectedCustomer(null);
            setDiscount(0);
            setNote('');
            
            setShowCheckout(false);
            setShowReceipt(true);
        }}
      />

      <HeldOrdersModal 
        isOpen={showHeldOrders} 
        onClose={() => setShowHeldOrders(false)}
        orders={heldSales}
        onRestore={restoreHeldOrder}
        onDelete={discardHeldSale}
      />

      <ReceiptModal 
        isOpen={showReceipt} 
        onClose={() => setShowReceipt(false)}
        transaction={lastTransaction}
      />
    </div>
  );
};

// --- Sub-Components ---

const CheckoutModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    total: number;
    onComplete: (method: string, tendered: number, change: number) => void;
}> = ({ isOpen, onClose, total, onComplete }) => {
    const [method, setMethod] = useState<'CASH' | 'CARD' | 'EFT'>('CASH');
    const [tendered, setTendered] = useState<string>('');

    const tenderedNum = Number(tendered);
    const change = tenderedNum > total ? tenderedNum - total : 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onComplete(method, method === 'CASH' ? tenderedNum : total, method === 'CASH' ? change : 0);
        setTendered('');
        setMethod('CASH');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Complete Payment" className="max-w-md">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center py-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-slate-500 text-sm mb-1">Total Amount Due</p>
                    <p className="text-4xl font-bold text-indigo-900">R{total.toFixed(2)}</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {['CASH', 'CARD', 'EFT'].map((m) => (
                        <button
                            key={m}
                            type="button"
                            onClick={() => setMethod(m as any)}
                            className={`py-3 rounded-lg border text-sm font-bold flex flex-col items-center justify-center gap-2 transition-all ${
                                method === m 
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200' 
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            {m === 'CASH' && <Banknote size={20} />}
                            {m === 'CARD' && <CreditCard size={20} />}
                            {m === 'EFT' && <Check size={20} />}
                            {m}
                        </button>
                    ))}
                </div>

                {method === 'CASH' && (
                    <div className="space-y-4 animate-in slide-in-from-top-2">
                        <div className="space-y-2">
                            <Label>Amount Tendered (R)</Label>
                            <Input 
                                type="number" 
                                autoFocus
                                required
                                value={tendered}
                                onChange={e => setTendered(e.target.value)}
                                className="text-lg h-12"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="flex justify-between items-center p-3 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-100">
                            <span className="font-semibold">Change Due</span>
                            <span className="text-xl font-bold">R{change.toFixed(2)}</span>
                        </div>
                    </div>
                )}

                <div className="pt-2">
                    <Button 
                        type="submit" 
                        className="w-full h-12 text-lg"
                        disabled={method === 'CASH' && tenderedNum < total}
                    >
                        Confirm Payment
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

const HeldOrdersModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    orders: any[];
    onRestore: (order: any) => void;
    onDelete: (id: string) => void;
}> = ({ isOpen, onClose, orders, onRestore, onDelete }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Parked Orders">
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {orders.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">No parked orders.</p>
                ) : (
                    orders.map(order => (
                        <div key={order.id} className="p-4 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors bg-white group">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-slate-800">{order.customer?.name || 'Guest Customer'}</h4>
                                    <p className="text-xs text-slate-500">{new Date(order.date).toLocaleString()}</p>
                                </div>
                                <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                    {order.items.length} items
                                </span>
                            </div>
                            <p className="text-sm text-slate-600 mb-4 bg-slate-50 p-2 rounded italic">
                                "{order.note}"
                            </p>
                            <div className="flex gap-2">
                                <Button 
                                    size="sm" 
                                    className="flex-1 gap-2"
                                    onClick={() => onRestore(order)}
                                >
                                    <PlayCircle size={16} /> Resume
                                </Button>
                                <Button 
                                    size="sm" variant="outline" 
                                    className="text-rose-600 hover:bg-rose-50 border-rose-200"
                                    onClick={() => onDelete(order.id)}
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div className="pt-4 mt-4 border-t text-right">
                <Button variant="ghost" onClick={onClose}>Close</Button>
            </div>
        </Modal>
    );
};

const ReceiptModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    transaction: any;
}> = ({ isOpen, onClose, transaction }) => {
    if (!transaction) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Transaction Successful">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={32} />
                </div>
                
                <h3 className="text-xl font-bold text-slate-800">Payment Complete</h3>
                <p className="text-slate-500">Total: <span className="font-bold text-slate-900">R{transaction.total.toFixed(2)}</span></p>
                
                <div className="bg-slate-50 p-4 rounded-lg text-sm space-y-2 border border-slate-100 text-left">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Payment Method</span>
                        <span className="font-medium">{transaction.method}</span>
                    </div>
                    {transaction.method === 'CASH' && (
                         <div className="flex justify-between">
                            <span className="text-slate-500">Change</span>
                            <span className="font-medium">R{transaction.change.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-slate-500">Customer</span>
                        <span className="font-medium">{transaction.customer?.name || 'Guest'}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                    <Button className="gap-2 bg-slate-800 text-white hover:bg-slate-900">
                        <Save size={18} /> Print Receipt
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default POS;
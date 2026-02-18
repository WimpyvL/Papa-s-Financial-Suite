import React, { useState } from 'react';
import { useFinancials } from '../context/FinancialContext';
import { Product } from '../types';
import { Search, PackagePlus, AlertTriangle, ArrowDownCircle, Pencil, Trash2, Plus, Filter } from 'lucide-react';
import { Button, Input, Card, Badge, Modal, Label, Select } from './UI';

const Inventory: React.FC = () => {
  const { products, updateProductStock, addProduct, updateProduct, deleteProduct } = useFinancials();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Derive unique categories from products
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setShowProductModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
        deleteProduct(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Inventory & Stock</h1>
        <div className="flex gap-2">
            <Button onClick={handleCreate} variant="primary" className="gap-2">
                <Plus size={20} /> Add Product
            </Button>
            <Button onClick={() => setShowReceiveModal(true)} variant="secondary" className="gap-2">
                <ArrowDownCircle size={20} /> Receive Stock
            </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <Input 
            placeholder="Search inventory..."
            className="pl-10 h-12 shadow-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="relative w-full md:w-64">
            <Filter className="absolute left-3 top-3.5 text-slate-400 z-10 pointer-events-none" size={16} />
            <Select 
                className="pl-9 h-12 shadow-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
            >
                {categories.map(cat => (
                    <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                ))}
            </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(product => (
          <Card key={product.id} className="p-5 flex flex-col relative overflow-hidden hover:shadow-md transition-shadow group">
            {product.stock < 10 && product.category !== 'Service' && (
              <div className="absolute top-0 right-0 bg-orange-100 text-orange-700 px-3 py-1 rounded-bl-xl text-xs font-bold flex items-center gap-1">
                <AlertTriangle size={12} /> Low Stock
              </div>
            )}
            
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                <PackagePlus size={24} />
              </div>
              <div className="text-right">
                 <p className="text-xs text-slate-400 uppercase font-semibold">Current Stock</p>
                 <p className={`text-2xl font-bold ${product.stock < 10 && product.category !== 'Service' ? 'text-orange-600' : 'text-slate-800'}`}>
                   {product.category === 'Service' ? '∞' : product.stock} <span className="text-sm font-normal text-slate-400">{product.unit}</span>
                 </p>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 text-lg mb-1">{product.name}</h3>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="text-xs">{product.category}</Badge>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <p className="text-xs text-slate-400">Cost Price</p>
                        <p className="font-medium text-slate-700">R{product.cost.toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400">Selling Price</p>
                        <p className="font-medium text-emerald-600">R{product.price.toFixed(2)}</p>
                    </div>
                </div>
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(product)} className="text-indigo-600 hover:bg-indigo-50">
                        <Pencil size={16} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(product.id)} className="text-rose-600 hover:bg-rose-50">
                        <Trash2 size={16} />
                    </Button>
                </div>
            </div>
          </Card>
        ))}
      </div>

      <ReceiveStockModal 
        isOpen={showReceiveModal}
        products={products} 
        onClose={() => setShowReceiveModal(false)}
        onReceive={updateProductStock}
      />

      <ProductFormModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        initialData={editingProduct}
        onSave={(data) => {
            if (editingProduct) {
                updateProduct(editingProduct.id, data);
            } else {
                addProduct({ id: `PROD-${Date.now()}`, stock: 0, ...data } as Product);
            }
        }}
      />
    </div>
  );
};

const ReceiveStockModal: React.FC<{
  isOpen: boolean;
  products: Product[];
  onClose: () => void;
  onReceive: (id: string, qty: number, isRestock: boolean, cost: number) => void;
}> = ({ isOpen, products, onClose, onReceive }) => {
  const [selectedId, setSelectedId] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedId && quantity > 0) {
      onReceive(selectedId, quantity, true, totalCost);
      onClose();
      setQuantity(0);
      setTotalCost(0);
      setSelectedId('');
    }
  };

  const selectedProduct = products.find(p => p.id === selectedId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Receive Stock">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Product</Label>
            <Select 
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              required
            >
              <option value="">Select product...</option>
              {products.filter(p => p.category !== 'Service').map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input 
                type="number" 
                value={quantity}
                onChange={e => {
                    const qty = Number(e.target.value);
                    setQuantity(qty);
                    if (selectedProduct) setTotalCost(qty * selectedProduct.cost);
                }}
                min="1"
                required
              />
            </div>
            <div className="space-y-2">
               <Label>Total Cost (R)</Label>
               <Input 
                 type="number"
                 value={totalCost}
                 onChange={e => setTotalCost(Number(e.target.value))}
                 min="0"
                 step="0.01"
                 required
               />
               <p className="text-xs text-slate-400">
                 Est. Unit Cost: {quantity > 0 ? (totalCost / quantity).toFixed(2) : 0}
               </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="secondary" type="submit">Confirm Receipt</Button>
          </div>
        </form>
    </Modal>
  );
};

const ProductFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    initialData: Product | null;
    onSave: (data: any) => void;
}> = ({ isOpen, onClose, initialData, onSave }) => {
    const [formData, setFormData] = useState({
        name: '', category: '', price: 0, cost: 0, unit: 'pc', stock: 0
    });

    React.useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                category: initialData.category,
                price: initialData.price,
                cost: initialData.cost,
                unit: initialData.unit,
                stock: initialData.stock
            });
        } else {
            setFormData({ name: '', category: 'Print', price: 0, cost: 0, unit: 'pc', stock: 0 });
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Product" : "Add New Product"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label>Product Name</Label>
                    <Input 
                        required 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                        placeholder="e.g. A4 Glossy Paper"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                            <option value="Print">Print</option>
                            <option value="Stock">Stock</option>
                            <option value="Service">Service</option>
                            <option value="Other">Other</option>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Unit</Label>
                        <Input 
                            value={formData.unit} 
                            onChange={e => setFormData({...formData, unit: e.target.value})} 
                            placeholder="e.g. pc, box, hour"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Selling Price (R)</Label>
                        <Input 
                            type="number" 
                            step="0.01" 
                            min="0"
                            required
                            value={formData.price} 
                            onChange={e => setFormData({...formData, price: Number(e.target.value)})} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Cost Price (R)</Label>
                        <Input 
                            type="number" 
                            step="0.01" 
                            min="0"
                            required
                            value={formData.cost} 
                            onChange={e => setFormData({...formData, cost: Number(e.target.value)})} 
                        />
                    </div>
                </div>
                {!initialData && (
                    <div className="space-y-2">
                         <Label>Initial Stock</Label>
                         <Input 
                            type="number" 
                            min="0"
                            value={formData.stock} 
                            onChange={e => setFormData({...formData, stock: Number(e.target.value)})} 
                         />
                         <p className="text-xs text-slate-400">You can add more stock later via "Receive Stock".</p>
                    </div>
                )}
                 {initialData && (
                    <div className="space-y-2">
                         <Label>Current Stock (Adjustment)</Label>
                         <Input 
                            type="number" 
                            min="0"
                            value={formData.stock} 
                            onChange={e => setFormData({...formData, stock: Number(e.target.value)})} 
                         />
                         <p className="text-xs text-orange-500">Warning: Changing this manually bypasses transaction history.</p>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" type="submit">Save Product</Button>
                </div>
            </form>
        </Modal>
    );
};

export default Inventory;
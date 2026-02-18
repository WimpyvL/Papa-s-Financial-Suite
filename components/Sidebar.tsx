import React, { useState } from 'react';
import { 
  Home, 
  ShoppingBag, 
  ShoppingCart, 
  Users, 
  FileText, 
  ChevronDown, 
  ChevronRight,
  Briefcase,
  Repeat,
  Wallet,
  Landmark,
  UserCog,
  BarChart2,
  FolderOpen,
  DollarSign
} from 'lucide-react';
import { cn } from '../utils/cn';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [openCategories, setOpenCategories] = useState<string[]>(['sales']);

  const toggleCategory = (id: string) => {
    setOpenCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const navStructure = [
    { type: 'item', id: 'dashboard', label: 'Home', icon: Home },
    { type: 'item', id: 'inventory', label: 'Items', icon: ShoppingBag },
    { 
      type: 'category', 
      id: 'sales', 
      label: 'Sales', 
      icon: ShoppingCart,
      items: [
        { id: 'customers', label: 'Customers', icon: Users },
        { id: 'quotes', label: 'Quotes', icon: Briefcase }, // Jobs
        { id: 'invoices', label: 'Invoices', icon: FileText },
        { id: 'recurring_invoices', label: 'Recurring Invoices', icon: Repeat },
        { id: 'pos', label: 'Point of Sale', icon: DollarSign },
        // { id: 'payments', label: 'Payments Received', icon: Wallet }, // Placeholder mapping to transactions in App.tsx if needed
        // { id: 'credit_notes', label: 'Credit Notes', icon: FileText },
      ]
    },
    { type: 'item', id: 'purchases', label: 'Purchases', icon: Wallet }, // Maps to Inventory or Expnses
    { type: 'item', id: 'banking', label: 'Banking', icon: Landmark },
    { type: 'item', id: 'accountant', label: 'Accountant', icon: UserCog },
    { type: 'item', id: 'reports', label: 'Reports', icon: BarChart2 },
    { type: 'item', id: 'documents', label: 'Documents', icon: FolderOpen },
  ];

  const renderItem = (item: any, isSubItem = false) => {
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group border border-transparent text-sm",
          isActive 
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 border-indigo-500/30' 
            : 'hover:bg-slate-800 hover:text-white text-slate-400',
          isSubItem ? 'pl-11' : ''
        )}
      >
        <item.icon size={isSubItem ? 16 : 20} className={cn("transition-colors", isActive ? 'text-indigo-100' : 'text-slate-500 group-hover:text-slate-300')} />
        <span className="font-medium">{item.label}</span>
      </button>
    );
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 h-screen fixed left-0 top-0 flex flex-col z-10 shadow-xl hidden md:flex">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
            P
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Papa's Signs</span>
        </div>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider ml-11">Financial Suite</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
        {navStructure.map((entry) => {
          if (entry.type === 'category') {
            const isOpen = openCategories.includes(entry.id);
            const Icon = entry.icon;
            return (
              <div key={entry.id} className="mb-2">
                <button 
                  onClick={() => toggleCategory(entry.id)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white text-slate-400 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    {Icon && <Icon size={20} className="text-slate-500 group-hover:text-slate-300" />}
                    <span className="font-medium">{entry.label}</span>
                  </div>
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                
                <div className={cn("overflow-hidden transition-all duration-300 ease-in-out space-y-1 mt-1", isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0")}>
                  {entry.items?.map((subItem) => renderItem(subItem, true))}
                </div>
              </div>
            );
          } else {
            return renderItem(entry);
          }
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded-lg p-3">
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500"></div>
                <div>
                    <p className="text-xs font-bold text-white">Admin User</p>
                    <p className="text-[10px] text-slate-400">admin@papassigns.co.za</p>
                </div>
            </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
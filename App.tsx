import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Invoices from './components/Invoices';
import Inventory from './components/Inventory';
import Transactions from './components/Transactions';
import Customers from './components/Customers';
import Jobs from './components/Jobs';
import Banking from './components/Banking';
import Reports from './components/Reports';
import Expenses from './components/Expenses';
import { FinancialProvider } from './context/FinancialContext';
import { Construction } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard'); // Default to Dashboard as "Home"

  const renderContent = () => {
    switch (activeTab) {
      // Home
      case 'dashboard': return <Dashboard />;
      
      // Items
      case 'inventory': return <Inventory />;
      
      // Sales Group
      case 'customers': return <Customers />;
      case 'quotes': return <Jobs />; // Jobs acts as Quotes/Workflow
      case 'jobs': return <Jobs />;
      case 'invoices': return <Invoices initialView="standard" />;
      case 'recurring_invoices': return <Invoices initialView="recurring" />;
      case 'pos': return <POS />;
      
      // Purchases
      case 'purchases': return <Expenses />;
      
      // Banking
      case 'banking': return <Banking />;

      // Accountant
      case 'accountant': return <Transactions />;

      // Reports
      case 'reports': return <Reports />;

      // Placeholders for non-implemented features
      case 'documents': 
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
                <Construction size={64} className="mb-4 text-slate-300" />
                <h2 className="text-2xl font-bold text-slate-600">Under Construction</h2>
                <p>The {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} module is coming soon.</p>
            </div>
        );

      default: return <Dashboard />;
    }
  };

  return (
    <FinancialProvider>
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 md:ml-64 transition-all duration-300">
          <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between mb-6">
               <div className="font-bold text-slate-800 text-xl">Papa's Signs</div>
               {/* Simplified mobile nav for demo */}
               <select 
                 className="bg-white border p-2 rounded-lg"
                 value={activeTab}
                 onChange={(e) => setActiveTab(e.target.value)}
               >
                 <option value="dashboard">Home</option>
                 <option value="inventory">Items</option>
                 <option value="quotes">Quotes</option>
                 <option value="invoices">Invoices</option>
                 <option value="pos">POS</option>
                 <option value="customers">Customers</option>
                 <option value="purchases">Expenses</option>
                 <option value="reports">Reports</option>
               </select>
            </div>

            {renderContent()}
          </div>
        </main>
      </div>
    </FinancialProvider>
  );
};

export default App;
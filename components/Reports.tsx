import React, { useState } from 'react';
import { Search, Star, MoreVertical, FileText, ChevronRight } from 'lucide-react';
import { Input, Card } from './UI';

interface ReportItem {
  id: string;
  name: string;
  category: string;
  createdBy: string;
  lastVisited: string;
  isFavorite: boolean;
}

const Reports: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = [
    { id: 'All', label: 'All Reports' },
    { id: 'Business Overview', label: 'Business Overview' },
    { id: 'Sales', label: 'Sales' },
    { id: 'Receivables', label: 'Receivables' },
    { id: 'Payments', label: 'Payments Received' },
    { id: 'Payables', label: 'Payables' },
    { id: 'Purchases', label: 'Purchases and Expenses' },
    { id: 'Banking', label: 'Banking' },
    { id: 'Accountant', label: 'Accountant' }
  ];

  const reports: ReportItem[] = [
    { id: '1', name: 'Profit and Loss', category: 'Business Overview', createdBy: 'System Generated', lastVisited: '2026/02/15 05:05 AM', isFavorite: true },
    { id: '2', name: 'Cash Flow Statement', category: 'Business Overview', createdBy: 'System Generated', lastVisited: '-', isFavorite: true },
    { id: '3', name: 'Balance Sheet', category: 'Business Overview', createdBy: 'System Generated', lastVisited: '-', isFavorite: true },
    { id: '4', name: 'Business Performance Ratios', category: 'Business Overview', createdBy: 'System Generated', lastVisited: '2026/02/15 12:21 AM', isFavorite: true },
    { id: '5', name: 'Movement of Equity', category: 'Business Overview', createdBy: 'System Generated', lastVisited: '-', isFavorite: true },
    { id: '6', name: 'Sales by Customer', category: 'Sales', createdBy: 'System Generated', lastVisited: '-', isFavorite: true },
    { id: '7', name: 'Sales by Item', category: 'Sales', createdBy: 'System Generated', lastVisited: '-', isFavorite: true },
    { id: '8', name: 'Sales by Sales Person', category: 'Sales', createdBy: 'System Generated', lastVisited: '-', isFavorite: true },
    { id: '9', name: 'Sales Summary', category: 'Sales', createdBy: 'System Generated', lastVisited: '2026/02/13 08:09 PM', isFavorite: true },
    { id: '10', name: 'AR Aging Summary', category: 'Receivables', createdBy: 'System Generated', lastVisited: '-', isFavorite: true },
    { id: '11', name: 'AR Aging Details', category: 'Receivables', createdBy: 'System Generated', lastVisited: '2025/05/22 09:00 AM', isFavorite: true },
    { id: '12', name: 'Invoice Details', category: 'Receivables', createdBy: 'System Generated', lastVisited: '-', isFavorite: true },
    { id: '13', name: 'Quote Details', category: 'Receivables', createdBy: 'System Generated', lastVisited: '-', isFavorite: true },
    { id: '14', name: 'Customer Balance Summary', category: 'Receivables', createdBy: 'System Generated', lastVisited: '-', isFavorite: true },
    { id: '15', name: 'Expense Details', category: 'Purchases', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
    { id: '16', name: 'Purchases by Vendor', category: 'Purchases', createdBy: 'System Generated', lastVisited: '-', isFavorite: false },
  ];

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || r.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-[calc(100vh-2rem)] gap-6">
      {/* Sidebar Navigation */}
      <div className="w-64 flex-shrink-0 flex flex-col gap-2">
         <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm mb-2 cursor-pointer hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3 text-indigo-600 font-medium">
                <FileText size={20} /> Home
            </div>
         </div>
         
         <div className="space-y-1 overflow-y-auto pr-2">
            <p className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Report Category</p>
            {categories.map(cat => (
                <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${
                        activeCategory === cat.id 
                        ? 'bg-indigo-50 text-indigo-700 font-medium' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    {cat.label}
                    {activeCategory === cat.id && <ChevronRight size={14} />}
                </button>
            ))}
         </div>

         <div className="mt-auto bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100">
            <h4 className="font-bold text-slate-800 text-sm mb-1">Advanced Analytics</h4>
            <p className="text-xs text-slate-500 mb-3">Get deeper insights with AI-powered analysis.</p>
            <button className="text-xs font-medium text-indigo-600 hover:underline">Try Analytics →</button>
         </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
         {/* Top Bar */}
         <div className="flex justify-between items-center mb-6">
             <h1 className="text-2xl font-bold text-slate-800">Reports Center</h1>
             <div className="flex gap-3">
                 <div className="relative w-80">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <Input 
                        placeholder="Search reports" 
                        className="pl-9 bg-white"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                 </div>
                 <button className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
                    <MoreVertical size={20} />
                 </button>
             </div>
         </div>

         {/* Reports List */}
         <Card className="flex-1 overflow-hidden flex flex-col bg-white border-slate-200 shadow-sm">
             <div className="bg-slate-50 border-b border-slate-200 p-3 grid grid-cols-12 gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                 <div className="col-span-4 pl-2">Report Name</div>
                 <div className="col-span-3">Report Category</div>
                 <div className="col-span-3">Created By</div>
                 <div className="col-span-2">Last Visited</div>
             </div>
             
             <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
                {filteredReports.map(report => (
                    <div key={report.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors group cursor-pointer">
                        <div className="col-span-4 flex items-center gap-3">
                            <Star 
                                size={16} 
                                className={`${report.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-slate-300 opacity-0 group-hover:opacity-100'} transition-all`} 
                            />
                            <span className="text-indigo-600 font-medium hover:underline">{report.name}</span>
                        </div>
                        <div className="col-span-3 text-sm text-slate-600">
                            {report.category}
                        </div>
                        <div className="col-span-3 text-sm text-slate-500">
                            {report.createdBy}
                        </div>
                        <div className="col-span-2 text-sm text-slate-500">
                            {report.lastVisited}
                        </div>
                    </div>
                ))}
                {filteredReports.length === 0 && (
                    <div className="p-8 text-center text-slate-400">
                        No reports found matching your search.
                    </div>
                )}
             </div>
         </Card>
      </div>
    </div>
  );
};

export default Reports;
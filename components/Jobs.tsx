import React, { useState } from 'react';
import { useFinancials } from '../context/FinancialContext';
import { Job, JobStatus, Customer, JobCost } from '../types';
import { 
  Briefcase, 
  Plus, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ChevronRight,
  Hammer,
  FileText,
  CreditCard,
  Truck,
  Mail,
  Bell,
  ThumbsUp,
  PenTool
} from 'lucide-react';
import { Button, Card, Badge, Modal, Label, Input, Select } from './UI';
import DocumentEditor from './DocumentEditor';

const Jobs: React.FC = () => {
  const { jobs, customers, addJob, updateJob, addJobCost, recordJobDeposit, sendJobReminder, processJobReminders } = useFinancials();
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [view, setView] = useState<'list' | 'detail' | 'quote_editor'>('list');

  // Quick Action State
  const [actionJob, setActionJob] = useState<Job | null>(null);
  const [showActionDeposit, setShowActionDeposit] = useState(false);
  const [showActionCost, setShowActionCost] = useState(false);

  // Helpers
  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.QUOTE: return 'bg-slate-100 text-slate-600 border-slate-200';
      case JobStatus.APPROVED: return 'bg-blue-100 text-blue-700 border-blue-200';
      case JobStatus.DEPOSIT_REQUESTED: return 'bg-purple-100 text-purple-700 border-purple-200';
      case JobStatus.DEPOSIT_RECEIVED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case JobStatus.IN_PRODUCTION: return 'bg-amber-100 text-amber-700 border-amber-200';
      case JobStatus.COMPLETED: return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case JobStatus.CLOSED: return 'bg-gray-800 text-gray-200 border-gray-700';
      default: return 'bg-slate-100';
    }
  };

  const getStatusIcon = (status: JobStatus) => {
    switch (status) {
        case JobStatus.QUOTE: return <FileText size={16} />;
        case JobStatus.APPROVED: return <ThumbsUp size={16} />;
        case JobStatus.IN_PRODUCTION: return <Hammer size={16} />;
        case JobStatus.DEPOSIT_RECEIVED: return <DollarSign size={16} />;
        case JobStatus.COMPLETED: return <Truck size={16} />;
        case JobStatus.CLOSED: return <CheckCircle size={16} />;
        default: return <Clock size={16} />;
    }
  };

  // Profitability Calculation
  const calculateProfit = (job: Job) => {
    const totalCosts = job.costs.reduce((sum, cost) => sum + cost.amount, 0);
    const profit = job.quoteTotal - totalCosts;
    const margin = job.quoteTotal > 0 ? (profit / job.quoteTotal) * 100 : 0;
    return { totalCosts, profit, margin };
  };

  // Quick Action Handlers
  const handleQuickCost = (e: React.MouseEvent, job: Job) => {
    e.stopPropagation();
    setActionJob(job);
    setShowActionCost(true);
  };

  const handleQuickDeposit = (e: React.MouseEvent, job: Job) => {
    e.stopPropagation();
    setActionJob(job);
    setShowActionDeposit(true);
  };

  if (view === 'quote_editor' && selectedJob) {
      return (
          <DocumentEditor 
            mode="QUOTE" 
            initialData={selectedJob} 
            onBack={() => setView('detail')} 
          />
      );
  }

  if (selectedJob && view === 'detail') {
    return (
      <JobDetail 
        job={selectedJob} 
        onBack={() => { setView('list'); setSelectedJob(null); }}
        onUpdateStatus={(s) => updateJob(selectedJob.id, { status: s })}
        onAddCost={(c) => addJobCost(selectedJob.id, c)}
        onDeposit={(amt, method) => recordJobDeposit(selectedJob.id, amt, method)}
        onSendReminder={() => sendJobReminder(selectedJob.id)}
        profitData={calculateProfit(selectedJob)}
        onDesignQuote={() => setView('quote_editor')}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             <Briefcase className="text-indigo-600" /> Job Workflow
           </h1>
           <p className="text-slate-500 text-sm">Manage quotes, production, and profitability.</p>
        </div>
        <div className="flex gap-2">
            <Button onClick={processJobReminders} variant="outline" className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                <Bell size={20} /> Run Reminders
            </Button>
            <Button onClick={() => setShowNewJobModal(true)} className="gap-2 shadow-lg shadow-indigo-200">
                <Plus size={20} /> New Job
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map(job => {
            const { margin } = calculateProfit(job);
            return (
                <Card 
                    key={job.id} 
                    className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-transparent hover:border-l-indigo-500 relative overflow-hidden"
                    onClick={() => { setSelectedJob(job); setView('detail'); }}
                >
                    {/* Quick Action Overlay */}
                    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-2">
                        <Button 
                            size="sm" variant="outline" 
                            className="bg-white/90 hover:bg-white shadow-sm h-8 px-2 text-xs backdrop-blur-sm"
                            onClick={(e) => handleQuickCost(e, job)}
                            title="Add Expense"
                        >
                            <Plus size={14} className="mr-1"/> Cost
                        </Button>
                        {job.balanceDue > 0 && job.status !== JobStatus.QUOTE && job.status !== JobStatus.CLOSED && (
                            <Button 
                                size="sm" variant="secondary"
                                className="shadow-sm h-8 px-2 text-xs"
                                onClick={(e) => handleQuickDeposit(e, job)}
                                title="Record Payment"
                            >
                                <DollarSign size={14} className="mr-1"/> Pay
                            </Button>
                        )}
                    </div>

                    <div className="p-5 space-y-4">
                        <div className="flex justify-between items-start">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border ${getStatusColor(job.status)}`}>
                                {getStatusIcon(job.status)} {job.status.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">{job.id}</span>
                        </div>

                        <div>
                            <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">{job.title}</h3>
                            <p className="text-slate-500 text-sm font-medium">{job.clientName}</p>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center">
                            <div>
                                <p className="text-xs text-slate-400 uppercase font-semibold">Balance Due</p>
                                <p className={`font-bold ${job.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    R{job.balanceDue.toLocaleString()}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400 uppercase font-semibold">Quote</p>
                                <p className="font-medium text-slate-700">R{job.quoteTotal.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                                <Calendar size={14} /> {job.startDate}
                            </div>
                            {job.status !== JobStatus.QUOTE && (
                                <div className={`font-bold ${margin < 20 ? 'text-orange-500' : 'text-emerald-600'}`}>
                                    {margin.toFixed(0)}% Margin
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            )
        })}
      </div>

      {/* Quick Action Modals for List View */}
      {actionJob && (
        <>
            <DepositModal 
                isOpen={showActionDeposit}
                onClose={() => { setShowActionDeposit(false); setActionJob(null); }}
                balanceDue={actionJob.balanceDue}
                onConfirm={(amt, method) => recordJobDeposit(actionJob.id, amt, method)}
            />
            <CostModal 
                isOpen={showActionCost}
                onClose={() => { setShowActionCost(false); setActionJob(null); }}
                onSave={(cost) => addJobCost(actionJob.id, cost)}
            />
        </>
      )}

      <CreateJobModal 
        isOpen={showNewJobModal} 
        onClose={() => setShowNewJobModal(false)}
        customers={customers}
        onSave={addJob}
      />
    </div>
  );
};

const JobDetail: React.FC<{
    job: Job;
    onBack: () => void;
    onUpdateStatus: (s: JobStatus) => void;
    onAddCost: (c: JobCost) => void;
    onDeposit: (amount: number, method: string) => void;
    onSendReminder: () => void;
    onDesignQuote: () => void;
    profitData: { totalCosts: number, profit: number, margin: number };
}> = ({ job, onBack, onUpdateStatus, onAddCost, onDeposit, onSendReminder, onDesignQuote, profitData }) => {
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showCostModal, setShowCostModal] = useState(false);

    const steps = [
        JobStatus.QUOTE, 
        JobStatus.APPROVED, 
        JobStatus.DEPOSIT_REQUESTED, 
        JobStatus.DEPOSIT_RECEIVED, 
        JobStatus.IN_PRODUCTION, 
        JobStatus.COMPLETED, 
        JobStatus.CLOSED
    ];
    // Mapping status to step index for progress bar
    const stepIndexMap: Record<string, number> = {
        [JobStatus.QUOTE]: 0,
        [JobStatus.APPROVED]: 1,
        [JobStatus.DEPOSIT_REQUESTED]: 2,
        [JobStatus.DEPOSIT_RECEIVED]: 3,
        [JobStatus.IN_PRODUCTION]: 4,
        [JobStatus.COMPLETED]: 5,
        [JobStatus.CLOSED]: 6
    };
    
    const currentStepIdx = stepIndexMap[job.status] ?? 0;
    
    // Check if reminder is relevant
    const showReminderButton = 
        (job.status === JobStatus.DEPOSIT_REQUESTED && job.depositPaid < job.depositRequired) ||
        (job.status === JobStatus.COMPLETED && job.balanceDue > 0);

    const handleApproveQuote = () => {
        if(window.confirm("Approve this quote? This will officially mark the job as approved and enable deposit requests.")) {
            onUpdateStatus(JobStatus.APPROVED);
        }
    };

    const handleRequestDeposit = () => {
        // You might trigger an email here in a real app
        onUpdateStatus(JobStatus.DEPOSIT_REQUESTED);
        alert("Deposit request status updated. (Simulated email sent to client)");
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={onBack} size="sm">← Back</Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{job.title}</h1>
                    <p className="text-slate-500">{job.clientName} • {job.id}</p>
                </div>
                <div className="ml-auto flex gap-2">
                    {/* Design Quote Button */}
                    <Button onClick={onDesignQuote} variant="outline" className="gap-2 border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100">
                        <PenTool size={18} /> Design Quote
                    </Button>

                    {showReminderButton && (
                        <Button onClick={onSendReminder} variant="outline" className="gap-2 border-indigo-200 text-indigo-700">
                            <Mail size={18} /> Send Reminder
                        </Button>
                    )}
                    
                    {job.status === JobStatus.QUOTE && (
                        <Button onClick={handleApproveQuote} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                            <CheckCircle size={18} /> Approve Quote
                        </Button>
                    )}
                    
                    {job.status === JobStatus.APPROVED && (
                        <div className="flex items-center gap-2 animate-in fade-in">
                             <span className="hidden md:inline-block text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                <CheckCircle size={12} className="inline mr-1"/> Quote Approved
                             </span>
                             <Button onClick={handleRequestDeposit} className="bg-purple-600 hover:bg-purple-700 gap-2">
                                <Mail size={18} /> Request Deposit
                            </Button>
                        </div>
                    )}
                    
                    {(job.status === JobStatus.DEPOSIT_REQUESTED) && (
                        <Button onClick={() => setShowDepositModal(true)} className="bg-emerald-600 hover:bg-emerald-700">
                            <DollarSign size={18} className="mr-2" /> Receive Deposit
                        </Button>
                    )}

                    {job.status === JobStatus.DEPOSIT_RECEIVED && (
                        <Button onClick={() => onUpdateStatus(JobStatus.IN_PRODUCTION)} className="bg-amber-600 hover:bg-amber-700">
                            <Hammer size={18} className="mr-2" /> Start Production
                        </Button>
                    )}
                    {job.status === JobStatus.IN_PRODUCTION && (
                         <Button onClick={() => onUpdateStatus(JobStatus.COMPLETED)} className="bg-indigo-600 hover:bg-indigo-700">
                            <CheckCircle size={18} className="mr-2" /> Mark Complete
                        </Button>
                    )}
                     {job.status === JobStatus.COMPLETED && job.balanceDue > 0 && (
                         <Button onClick={() => setShowDepositModal(true)} className="bg-emerald-600 hover:bg-emerald-700">
                            Receive Final Balance
                        </Button>
                    )}
                     {job.status === JobStatus.COMPLETED && job.balanceDue <= 0 && (
                         <Button onClick={() => onUpdateStatus(JobStatus.CLOSED)} variant="secondary">
                            Close Job
                        </Button>
                    )}
                </div>
            </div>

            {/* Status Stepper */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 overflow-x-auto">
                <div className="flex items-center justify-between min-w-[700px]">
                    {steps.map((step, idx) => {
                        const isCompleted = currentStepIdx >= idx;
                        const isCurrent = currentStepIdx === idx;
                        return (
                            <div key={step} className="flex flex-col items-center gap-2 relative z-10 flex-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                    isCompleted ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                                }`}>
                                    {idx + 1}
                                </div>
                                <span className={`text-[10px] font-bold uppercase text-center whitespace-nowrap px-1 ${isCurrent ? 'text-indigo-600' : 'text-slate-400'}`}>
                                    {step.replace(/_/g, ' ')}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Financial Overview */}
                <Card className="lg:col-span-2 space-y-6 p-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-sm text-slate-500 mb-1">Quote Total</p>
                            <p className="text-2xl font-bold text-slate-800">R{job.quoteTotal.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                            <p className="text-sm text-emerald-600 mb-1">Paid to Date</p>
                            <p className="text-2xl font-bold text-emerald-700">R{job.depositPaid.toLocaleString()}</p>
                        </div>
                         <div className="p-4 bg-rose-50 rounded-lg border border-rose-100">
                            <p className="text-sm text-rose-600 mb-1">Balance Due</p>
                            <p className="text-2xl font-bold text-rose-700">R{job.balanceDue.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800">Profitability Engine</h3>
                            <Badge variant={profitData.margin < 30 ? 'warning' : 'success'}>
                                {profitData.margin.toFixed(1)}% Margin
                            </Badge>
                        </div>
                        <div className="bg-slate-900 rounded-xl p-6 text-white grid grid-cols-3 gap-8">
                             <div>
                                 <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Project Revenue</p>
                                 <p className="text-2xl font-bold">R{job.quoteTotal.toLocaleString()}</p>
                             </div>
                             <div>
                                 <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Total Costs</p>
                                 <p className="text-2xl font-bold text-rose-300">R{profitData.totalCosts.toLocaleString()}</p>
                             </div>
                             <div>
                                 <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Net Profit</p>
                                 <p className="text-2xl font-bold text-emerald-300">R{profitData.profit.toLocaleString()}</p>
                             </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800">Material & Labor Costs</h3>
                            <Button size="sm" variant="outline" onClick={() => setShowCostModal(true)} className="gap-2">
                                <Plus size={16} /> Add Cost
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {job.costs.length === 0 ? (
                                <p className="text-slate-400 italic text-sm">No costs recorded yet.</p>
                            ) : (
                                job.costs.map(cost => (
                                    <div key={cost.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <div>
                                            <p className="font-medium text-slate-800">{cost.description}</p>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-[10px]">{cost.category}</Badge>
                                                <span className="text-xs text-slate-400">{new Date(cost.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <p className="font-bold text-slate-700">R{cost.amount.toFixed(2)}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </Card>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <h3 className="font-bold text-slate-800 mb-4">Job Details</h3>
                        <div className="space-y-4 text-sm">
                             <div>
                                <label className="text-slate-500 block text-xs uppercase font-semibold">Description</label>
                                <p className="text-slate-700 mt-1">{job.description}</p>
                             </div>
                             <div>
                                <label className="text-slate-500 block text-xs uppercase font-semibold">Deposit Req.</label>
                                <p className="text-slate-700 mt-1">R{job.depositRequired.toLocaleString()}</p>
                             </div>
                             <div>
                                <label className="text-slate-500 block text-xs uppercase font-semibold">Start Date</label>
                                <p className="text-slate-700 mt-1">{job.startDate}</p>
                             </div>
                             {job.items && job.items.length > 0 && (
                                 <div>
                                     <label className="text-slate-500 block text-xs uppercase font-semibold mb-1">Quote Items</label>
                                     <div className="space-y-1">
                                        {job.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-xs text-slate-600 bg-slate-50 p-1 rounded">
                                                <span className="truncate max-w-[120px]">{item.description}</span>
                                                <span>R{item.total.toFixed(0)}</span>
                                            </div>
                                        ))}
                                     </div>
                                 </div>
                             )}
                             {job.lastReminderDate && (
                                 <div className="pt-2 border-t border-slate-100 mt-2">
                                    <label className="text-slate-500 block text-xs uppercase font-semibold text-emerald-600">Last Reminder Sent</label>
                                    <p className="text-slate-700 mt-1 text-xs">{new Date(job.lastReminderDate).toLocaleString()}</p>
                                 </div>
                             )}
                        </div>
                    </Card>
                    
                    <Card className="p-6 bg-yellow-50/50 border-yellow-100">
                        <h3 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                            <AlertTriangle size={18} /> Production Notes
                        </h3>
                        <textarea 
                            className="w-full bg-white border border-yellow-200 rounded-lg p-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            rows={4}
                            placeholder="Add notes for the production team..."
                            defaultValue={job.notes}
                        />
                    </Card>
                </div>
            </div>

            <DepositModal 
                isOpen={showDepositModal}
                onClose={() => setShowDepositModal(false)}
                balanceDue={job.balanceDue}
                onConfirm={onDeposit}
            />

            <CostModal 
                isOpen={showCostModal}
                onClose={() => setShowCostModal(false)}
                onSave={onAddCost}
            />
        </div>
    );
};

// --- Modals ---

const CreateJobModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    customers: Customer[];
    onSave: (job: Job) => void;
}> = ({ isOpen, onClose, customers, onSave }) => {
    const [formData, setFormData] = useState({
        clientId: '',
        title: '',
        description: '',
        quoteTotal: 0,
        depositPercent: 50
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const customer = customers.find(c => c.id === formData.clientId);
        if (!customer) return;

        const quoteTotal = Number(formData.quoteTotal);
        const depositRequired = quoteTotal * (formData.depositPercent / 100);

        const newJob: Job = {
            id: `JOB-${Date.now().toString().slice(-4)}`,
            clientId: formData.clientId,
            clientName: customer.name,
            title: formData.title,
            description: formData.description,
            status: JobStatus.QUOTE,
            quoteTotal,
            depositRequired,
            depositPaid: 0,
            balanceDue: quoteTotal,
            costs: [],
            startDate: new Date().toISOString().split('T')[0]
        };

        onSave(newJob);
        onClose();
        setFormData({ clientId: '', title: '', description: '', quoteTotal: 0, depositPercent: 50 });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Start New Job">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label>Client</Label>
                    <Select 
                        required 
                        value={formData.clientId}
                        onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                    >
                        <option value="">Select Client...</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Job Title</Label>
                    <Input 
                        required 
                        placeholder="e.g. Main Street Shopfront"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Description</Label>
                    <textarea 
                        className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                        placeholder="Details about dimensions, materials..."
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Quote Total (R)</Label>
                        <Input 
                            type="number" required min="0"
                            value={formData.quoteTotal}
                            onChange={e => setFormData({ ...formData, quoteTotal: Number(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Deposit Req. (%)</Label>
                        <Input 
                            type="number" required min="0" max="100"
                            value={formData.depositPercent}
                            onChange={e => setFormData({ ...formData, depositPercent: Number(e.target.value) })}
                        />
                    </div>
                </div>
                <div className="pt-4 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Create Job</Button>
                </div>
            </form>
        </Modal>
    );
};

const DepositModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    balanceDue: number;
    onConfirm: (amount: number, method: string) => void;
}> = ({ isOpen, onClose, balanceDue, onConfirm }) => {
    const [amount, setAmount] = useState(balanceDue); // Default to full balance
    const [method, setMethod] = useState('EFT');

    // Update amount if balanceDue changes
    React.useEffect(() => {
        setAmount(balanceDue);
    }, [balanceDue]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(amount, method);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Record Payment">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-emerald-50 p-4 rounded-lg text-emerald-800 mb-4">
                    <p className="text-xs uppercase font-bold">Outstanding Balance</p>
                    <p className="text-2xl font-bold">R{balanceDue.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                    <Label>Amount Received (R)</Label>
                    <Input 
                        type="number" required min="1"
                        value={amount}
                        onChange={e => setAmount(Number(e.target.value))}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select value={method} onChange={e => setMethod(e.target.value)}>
                        <option value="EFT">EFT</option>
                        <option value="CARD">Card</option>
                        <option value="CASH">Cash</option>
                    </Select>
                </div>
                <div className="pt-4 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="secondary">Confirm Payment</Button>
                </div>
            </form>
        </Modal>
    );
};

const CostModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (cost: JobCost) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        description: '',
        amount: 0,
        category: 'Materials' as any
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: `COST-${Date.now()}`,
            description: formData.description,
            amount: Number(formData.amount),
            category: formData.category,
            date: new Date().toISOString()
        });
        onClose();
        setFormData({ description: '', amount: 0, category: 'Materials' });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Job Cost">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label>Description</Label>
                    <Input 
                        required placeholder="e.g. Vinyl Roll 5m"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Amount (R)</Label>
                        <Input 
                            type="number" required min="0"
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as any })}>
                            <option value="Materials">Materials</option>
                            <option value="Labor">Labor</option>
                            <option value="Subcontracting">Subcontracting</option>
                            <option value="Vehicle Fuel">Vehicle Fuel</option>
                            <option value="Equipment Maintenance">Equipment Maintenance</option>
                            <option value="Other">Other</option>
                        </Select>
                    </div>
                </div>
                <div className="pt-4 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Add Cost</Button>
                </div>
            </form>
        </Modal>
    );
};

export default Jobs;
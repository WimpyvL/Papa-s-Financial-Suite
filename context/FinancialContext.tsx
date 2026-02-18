import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  FinancialContextType, 
  Product, 
  Invoice, 
  Transaction, 
  TransactionType, 
  InvoiceStatus,
  CartItem,
  Customer,
  RecurringInvoiceTemplate,
  InvoiceItem,
  HeldSale,
  Job,
  JobStatus,
  JobCost,
  BankAccount,
  InvoiceDesign
} from '../types';

const defaultProducts: Product[] = [
  { id: '1', name: 'Premium Business Cards (1000)', category: 'Print', price: 85.00, cost: 30.00, stock: 50, unit: 'box' },
  { id: '2', name: 'A4 Glossy Paper Ream', category: 'Stock', price: 12.50, cost: 6.00, stock: 120, unit: 'ream' },
  { id: '3', name: 'Graphic Design Service', category: 'Service', price: 75.00, cost: 0, stock: 9999, unit: 'hour' },
  { id: '4', name: 'Large Format Banner (Vinyl)', category: 'Print', price: 120.00, cost: 45.00, stock: 20, unit: 'roll' },
  { id: '5', name: 'Binding Combs (Black)', category: 'Stock', price: 0.50, cost: 0.10, stock: 500, unit: 'pc' },
];

const defaultInvoices: Invoice[] = [
  {
    id: 'INV-2023-001',
    customerName: 'Acme Corp',
    customerEmail: 'billing@acme.com',
    date: '2023-10-01',
    dueDate: '2023-10-15',
    items: [{ id: '1', productId: '1', description: 'Business Cards', quantity: 2, unitPrice: 85, total: 170 }],
    subtotal: 170,
    tax: 17,
    total: 187,
    status: InvoiceStatus.PAID
  }
];

const defaultBankAccounts: BankAccount[] = [
    { id: 'acc_2', name: 'Petty Cash', type: 'CASH', accountNumber: 'N/A', currency: 'ZAR' },
    { id: 'acc_3', name: 'Undeposited Funds', type: 'OTHER', accountNumber: 'Clearing', currency: 'ZAR' },
];

const defaultTransactions: Transaction[] = [
  { id: 't3', date: '2023-10-05', type: TransactionType.SALE, amount: 250, description: 'Cash Sale - Walk in', paymentMethod: 'CASH', accountId: 'acc_2' },
];

const defaultCustomers: Customer[] = [
  { id: 'c1', name: 'Acme Corp', email: 'billing@acme.com', phone: '555-0123', address: '123 Corp Lane', notes: 'Preferred shipping via FedEx' },
  { id: 'c2', name: 'John Doe Designs', email: 'john@doedesigns.com', phone: '555-9876', address: '45 Creative Blvd', notes: 'Loyal customer since 2021' },
  { id: 'c3', name: 'Bakery on Main', email: 'info@mainbakery.co.za', phone: '555-5555', address: '88 Main Rd', notes: '' }
];

const defaultJobs: Job[] = [
  {
    id: 'JOB-101',
    clientId: 'c3',
    clientName: 'Bakery on Main',
    title: 'Shopfront Signage Revamp',
    description: 'Replace main lightgox acrylics and install window vinyls.',
    status: JobStatus.IN_PRODUCTION,
    quoteTotal: 15000,
    depositRequired: 7500,
    depositPaid: 7500,
    balanceDue: 7500,
    startDate: new Date().toISOString().split('T')[0],
    costs: [
      { id: 'cost1', description: 'Acrylic Sheets (White)', amount: 2500, category: 'Materials', date: new Date().toISOString() },
      { id: 'cost2', description: 'Vinyl Cutting Labor', amount: 800, category: 'Labor', date: new Date().toISOString() }
    ],
    items: [
        { id: 'ji1', description: 'Lightbox Acrylic Replacement (3000x1200mm)', quantity: 1, unitPrice: 8500, total: 8500 },
        { id: 'ji2', description: 'Window Vinyls - Contravision', quantity: 4, unitPrice: 1200, total: 4800 },
        { id: 'ji3', description: 'Installation Labor', quantity: 1, unitPrice: 1700, total: 1700 }
    ],
    lastReminderDate: undefined
  },
  {
    id: 'JOB-102',
    clientId: 'c1',
    clientName: 'Acme Corp',
    title: 'Vehicle Branding - Fleet',
    description: 'Full wrap for 2 delivery vans.',
    status: JobStatus.QUOTE,
    quoteTotal: 28000,
    depositRequired: 14000,
    depositPaid: 0,
    balanceDue: 28000,
    startDate: new Date().toISOString().split('T')[0],
    costs: [],
    items: [
         { id: 'ji4', description: 'Vehicle Wrap - Van (Print & Install)', quantity: 2, unitPrice: 14000, total: 28000 },
    ],
    lastReminderDate: undefined
  }
];

const defaultInvoiceDesign: InvoiceDesign = {
    primaryColor: '#4f46e5',
    secondaryColor: '#f8fafc',
    font: 'Inter',
    template: 'modern',
    businessName: "Papa's Signs",
    businessAddress: "123 Signage Street, Cape Town, 8001",
    businessEmail: "accounts@papassigns.co.za",
    businessPhone: "+27 21 555 0123",
    footerText: "Thank you for your business! Please pay within 14 days."
};

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [invoices, setInvoices] = useState<Invoice[]>(defaultInvoices);
  const [transactions, setTransactions] = useState<Transaction[]>(defaultTransactions);
  const [customers, setCustomers] = useState<Customer[]>(defaultCustomers);
  const [recurringTemplates, setRecurringTemplates] = useState<RecurringInvoiceTemplate[]>([]);
  const [heldSales, setHeldSales] = useState<HeldSale[]>([]);
  const [jobs, setJobs] = useState<Job[]>(defaultJobs);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(defaultBankAccounts);
  const [invoiceDesign, setInvoiceDesign] = useState<InvoiceDesign>(defaultInvoiceDesign);

  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const updateProduct = (id: string, data: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const updateProductStock = (id: string, quantity: number, isRestock: boolean, cost: number = 0) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, stock: isRestock ? p.stock + quantity : p.stock - quantity };
      }
      return p;
    }));

    if (isRestock && cost > 0) {
      const product = products.find(p => p.id === id);
      addTransaction({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        type: TransactionType.RESTOCK,
        amount: -(cost),
        description: `Restock: ${product?.name} (${quantity} units)`,
        accountId: 'acc_2' // Defaulting to Petty Cash for small restocks if no main bank
      });
    }
  };

  // Helper to deduct stock based on invoice items
  const deductStockForInvoice = (items: InvoiceItem[]) => {
    setProducts(currentProducts => {
      return currentProducts.map(p => {
        const item = items.find(i => i.productId === p.id);
        if (item && p.category !== 'Service') {
          return { ...p, stock: p.stock - item.quantity };
        }
        return p;
      });
    });
  };

  const createInvoice = (invoice: Invoice) => {
    setInvoices(prev => [invoice, ...prev]);
    // Deduct stock when invoice is created
    deductStockForInvoice(invoice.items);
  };

  const updateInvoiceStatus = (id: string, status: InvoiceStatus) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === id) {
        // If marking as paid, add transaction
        if (status === InvoiceStatus.PAID && inv.status !== InvoiceStatus.PAID) {
           addTransaction({
            id: `pay_${Date.now()}`,
            date: new Date().toISOString(),
            type: TransactionType.INVOICE_PAYMENT,
            amount: inv.total,
            description: `Payment for ${inv.id} - ${inv.customerName}`,
            referenceId: inv.id,
            accountId: 'acc_3' // Default to Undeposited Funds
          });
        }
        return { ...inv, status };
      }
      return inv;
    }));
  };

  const addTransaction = (transaction: Transaction) => {
    // If no account ID is provided, default to 'acc_3' (Undeposited Funds)
    const txWithAccount = {
        ...transaction,
        accountId: transaction.accountId || 'acc_3'
    };
    setTransactions(prev => [txWithAccount, ...prev]);
  };

  const processSale = (items: CartItem[], total: number, paymentMethod: string, customerId?: string) => {
    // 1. Deduct Stock
    items.forEach(item => {
      if (item.category !== 'Service') {
        updateProductStock(item.id, item.quantity, false);
      }
    });

    // 2. Add Transaction
    const customer = customers.find(c => c.id === customerId);
    const desc = customer 
      ? `POS Sale - ${items.length} items (${customer.name})`
      : `POS Sale - ${items.length} items`;
    
    // Determine account based on payment method
    let accountId = 'acc_3'; // Default to Undeposited Funds
    if (paymentMethod === 'CASH') accountId = 'acc_2'; // Petty Cash
    if (paymentMethod === 'CARD') accountId = 'acc_3'; 

    addTransaction({
      id: `pos_${Date.now()}`,
      date: new Date().toISOString(),
      type: TransactionType.SALE,
      amount: total,
      description: desc,
      paymentMethod,
      accountId
    });
  };

  // CRM Features
  const addCustomer = (customer: Customer) => {
    setCustomers(prev => [...prev, customer]);
  };

  const updateCustomer = (id: string, data: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  // Recurring Invoices Features
  const addRecurringTemplate = (template: RecurringInvoiceTemplate) => {
    setRecurringTemplates(prev => [...prev, template]);
  };

  const processRecurringInvoices = () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    let generatedCount = 0;

    const updatedTemplates = recurringTemplates.map(template => {
       const dueDate = new Date(template.nextDueDate);
       dueDate.setHours(0,0,0,0);

       if (template.active && dueDate <= today) {
          // Generate Invoice
          const subtotal = template.items.reduce((sum, i) => sum + i.total, 0);
          const tax = subtotal * 0.1;
          const total = subtotal + tax;

          const newInvoice: Invoice = {
            id: `INV-REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            customerId: template.customerId,
            customerName: template.customerName,
            customerEmail: template.customerEmail,
            date: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
            items: template.items,
            subtotal,
            tax,
            total,
            status: InvoiceStatus.SENT,
            notes: 'Automatically generated recurring invoice.'
          };

          createInvoice(newInvoice);
          generatedCount++;

          // Calculate Next Due Date
          const nextDate = new Date(dueDate);
          if (template.interval === 'WEEKLY') nextDate.setDate(nextDate.getDate() + 7);
          if (template.interval === 'MONTHLY') nextDate.setMonth(nextDate.getMonth() + 1);
          if (template.interval === 'ANNUALLY') nextDate.setFullYear(nextDate.getFullYear() + 1);

          return { ...template, nextDueDate: nextDate.toISOString().split('T')[0] };
       }
       return template;
    });
    
    setRecurringTemplates(updatedTemplates);
    if(generatedCount > 0) {
      alert(`Generated ${generatedCount} recurring invoices.`);
    } else {
      alert("No recurring invoices due today.");
    }
  };

  // POS Parked Sales
  const parkSale = (items: CartItem[], customer: Customer | null, note: string) => {
    const heldSale: HeldSale = {
      id: `HOLD-${Date.now()}`,
      items,
      customer,
      date: new Date().toISOString(),
      note
    };
    setHeldSales(prev => [...prev, heldSale]);
  };

  const retrieveSale = (id: string) => {
    // This function is technically a placeholder as the consuming component
    // will grab the sale from 'heldSales' and then call 'discardHeldSale'
    // but we can expose it if needed.
  };

  const discardHeldSale = (id: string) => {
    setHeldSales(prev => prev.filter(s => s.id !== id));
  };

  // --- JOB / PROJECT LOGIC ---

  const addJob = (job: Job) => {
    setJobs(prev => [job, ...prev]);
  };

  const updateJob = (id: string, data: Partial<Job>) => {
    setJobs(prev => prev.map(job => job.id === id ? { ...job, ...data } : job));
  };

  const addJobCost = (jobId: string, cost: JobCost) => {
    setJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        return { ...job, costs: [...job.costs, cost] };
      }
      return job;
    }));
    // Also add as an expense transaction
    addTransaction({
      id: `exp-${Date.now()}`,
      date: cost.date,
      type: TransactionType.EXPENSE,
      amount: -(cost.amount),
      description: `Job Expense [${cost.category}]: ${cost.description}`,
      jobId,
      accountId: 'acc_2' // Pay from Petty Cash
    });
  };

  const recordJobDeposit = (jobId: string, amount: number, method: string) => {
    setJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        const newDepositPaid = job.depositPaid + amount;
        const newBalance = job.quoteTotal - newDepositPaid;
        // Auto-update status if deposit met
        let newStatus = job.status;
        if (newStatus === JobStatus.DEPOSIT_REQUESTED || newStatus === JobStatus.APPROVED || newStatus === JobStatus.QUOTE) {
           if (newDepositPaid >= job.depositRequired) {
             newStatus = JobStatus.DEPOSIT_RECEIVED;
           }
        }
        if (newBalance <= 0) {
            newStatus = JobStatus.CLOSED; // Auto close if fully paid? Or keep open? Let's strictly update balance here.
        }

        return { 
          ...job, 
          depositPaid: newDepositPaid, 
          balanceDue: newBalance,
          status: newStatus
        };
      }
      return job;
    }));

    // Record Transaction
    const job = jobs.find(j => j.id === jobId);
    // Determine account
    let accountId = 'acc_3'; // Default to Undeposited
    if(method === 'CASH') accountId = 'acc_2';

    addTransaction({
      id: `dep-${Date.now()}`,
      date: new Date().toISOString(),
      type: TransactionType.DEPOSIT,
      amount: amount,
      description: `Deposit for Job ${job?.id}: ${job?.title}`,
      paymentMethod: method,
      jobId,
      accountId
    });
  };

  const sendJobReminder = (jobId: string) => {
    setJobs(prev => prev.map(job => {
        if (job.id === jobId) {
            return { ...job, lastReminderDate: new Date().toISOString() };
        }
        return job;
    }));
    const job = jobs.find(j => j.id === jobId);
    if(job) {
        const type = job.balanceDue === job.quoteTotal ? 'Deposit' : 'Balance';
        alert(`[Email Sent] ${type} reminder sent to ${job.clientName} for job "${job.title}".`);
    }
  };

  const processJobReminders = () => {
    let reminderCount = 0;
    const now = new Date();
    
    const updatedJobs = jobs.map(job => {
        let shouldRemind = false;
        
        // Scenario 1: Deposit Requested but not paid (fully)
        if (job.status === JobStatus.DEPOSIT_REQUESTED && job.depositPaid < job.depositRequired) {
            shouldRemind = true;
        }

        // Scenario 2: Job Completed but balance remains
        if (job.status === JobStatus.COMPLETED && job.balanceDue > 0) {
            shouldRemind = true;
        }

        if (shouldRemind) {
            // Check if reminder was sent recently (e.g., within last 3 days)
            // For this demo, if lastReminderDate is null, we send.
            if (!job.lastReminderDate) {
                reminderCount++;
                return { ...job, lastReminderDate: now.toISOString() };
            }
            
            const lastDate = new Date(job.lastReminderDate);
            const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
            
            if (diffDays >= 3) {
                 reminderCount++;
                 return { ...job, lastReminderDate: now.toISOString() };
            }
        }
        return job;
    });

    if (reminderCount > 0) {
        setJobs(updatedJobs);
        alert(`[Auto-Automation] Sent ${reminderCount} payment reminders successfully.`);
    } else {
        alert("No reminders due at this time.");
    }
  };
  
  const updateInvoiceDesign = (design: Partial<InvoiceDesign>) => {
      setInvoiceDesign(prev => ({ ...prev, ...design }));
  };

  return (
    <FinancialContext.Provider value={{
      products,
      invoices,
      transactions,
      customers,
      recurringTemplates,
      heldSales,
      jobs,
      bankAccounts,
      invoiceDesign,
      addProduct,
      updateProduct,
      deleteProduct,
      updateProductStock,
      createInvoice,
      updateInvoiceStatus,
      addTransaction,
      processSale,
      addCustomer,
      updateCustomer,
      addRecurringTemplate,
      processRecurringInvoices,
      parkSale,
      retrieveSale,
      discardHeldSale,
      addJob,
      updateJob,
      addJobCost,
      recordJobDeposit,
      sendJobReminder,
      processJobReminders,
      updateInvoiceDesign
    }}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancials = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancials must be used within a FinancialProvider');
  }
  return context;
};
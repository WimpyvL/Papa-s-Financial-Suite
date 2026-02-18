
export enum TransactionType {
  SALE = 'SALE',
  EXPENSE = 'EXPENSE',
  RESTOCK = 'RESTOCK',
  INVOICE_PAYMENT = 'INVOICE_PAYMENT',
  DEPOSIT = 'DEPOSIT'
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  unit: string; // e.g., 'sheet', 'hour', 'pack'
}

export interface CartItem extends Product {
  quantity: number;
}

export interface InvoiceItem {
  id: string;
  productId?: string; // Link to inventory
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE'
}

export interface Invoice {
  id: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  notes?: string;
}

export interface InvoiceDesign {
  primaryColor: string;
  secondaryColor: string;
  font: 'Inter' | 'Serif' | 'Mono';
  template: 'modern' | 'classic' | 'minimal' | 'bold' | 'corporate';
  logoUrl?: string;
  businessName: string;
  businessAddress: string;
  businessEmail: string;
  businessPhone: string;
  footerText: string;
}

export interface BankAccount {
  id: string;
  name: string;
  type: 'BANK' | 'CASH' | 'OTHER';
  accountNumber: string;
  currency: string;
  bankName?: string;
  lastSynced?: string;
}

export interface Transaction {
  id: string;
  date: string; // ISO string
  type: TransactionType;
  amount: number;
  description: string;
  referenceId?: string; // ID of invoice or order
  paymentMethod?: string;
  jobId?: string;
  accountId?: string; // Link to BankAccount
  // Expense Specific Fields
  vendor?: string;
  expenseCategory?: string; // e.g. "Rent", "Travel"
  attachmentUrl?: string;
  customerId?: string; // Billable to customer
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

export type RecurrenceInterval = 'WEEKLY' | 'MONTHLY' | 'ANNUALLY';

export interface RecurringInvoiceTemplate {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: InvoiceItem[];
  interval: RecurrenceInterval;
  nextDueDate: string;
  active: boolean;
}

export interface HeldSale {
  id: string;
  items: CartItem[];
  customer: Customer | null;
  date: string;
  note: string;
}

// --- Job / Project Types ---

export enum JobStatus {
  QUOTE = 'QUOTE',
  APPROVED = 'APPROVED', 
  DEPOSIT_REQUESTED = 'DEPOSIT_REQUESTED',
  DEPOSIT_RECEIVED = 'DEPOSIT_RECEIVED', // Ready for production
  IN_PRODUCTION = 'IN_PRODUCTION',
  COMPLETED = 'COMPLETED', // Ready for install/pickup
  INVOICED = 'INVOICED', 
  CLOSED = 'CLOSED' // Paid in full
}

export interface JobCost {
  id: string;
  description: string;
  amount: number;
  category: 'Materials' | 'Labor' | 'Subcontracting' | 'Vehicle Fuel' | 'Equipment Maintenance' | 'Other';
  date: string;
}

export interface Job {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  description: string;
  status: JobStatus;
  quoteTotal: number;
  items?: InvoiceItem[]; // Added for detailed Quotes
  depositRequired: number; // usually 50%
  depositPaid: number;
  balanceDue: number; 
  costs: JobCost[];
  startDate: string;
  deadline?: string;
  notes?: string;
  lastReminderDate?: string;
}

export interface FinancialState {
  products: Product[];
  invoices: Invoice[];
  transactions: Transaction[];
  customers: Customer[];
  recurringTemplates: RecurringInvoiceTemplate[];
  heldSales: HeldSale[];
  jobs: Job[];
  bankAccounts: BankAccount[];
  invoiceDesign: InvoiceDesign;
}

export interface FinancialContextType extends FinancialState {
  addProduct: (product: Product) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateProductStock: (id: string, quantity: number, isRestock: boolean, cost?: number) => void;
  createInvoice: (invoice: Invoice) => void;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  addTransaction: (transaction: Transaction) => void;
  processSale: (items: CartItem[], total: number, paymentMethod: string, customerId?: string) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  addRecurringTemplate: (template: RecurringInvoiceTemplate) => void;
  processRecurringInvoices: () => void;
  parkSale: (items: CartItem[], customer: Customer | null, note: string) => void;
  retrieveSale: (id: string) => void;
  discardHeldSale: (id: string) => void;
  // Job Actions
  addJob: (job: Job) => void;
  updateJob: (id: string, data: Partial<Job>) => void;
  addJobCost: (jobId: string, cost: JobCost) => void;
  recordJobDeposit: (jobId: string, amount: number, method: string) => void;
  sendJobReminder: (jobId: string) => void;
  processJobReminders: () => void;
  // Design Actions
  updateInvoiceDesign: (design: Partial<InvoiceDesign>) => void;
}

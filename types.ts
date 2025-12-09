
export type TransactionType = 'income' | 'expense' | 'investment' | 'transfer';

export interface HealthSettings {
  // Thresholds for the financial health meter (in currency units)
  criticalThreshold: number;      // Balance < this = Critical (Red)
  attentionThreshold: number;     // Balance < this = Attention (Pink)
  moderateThreshold: number;      // Balance < this = Moderate (Orange)
  goodThreshold: number;          // Balance < this = Good (Light Green)
  // Balance >= goodThreshold = Excellent (Dark Green)
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  currency: string;
  theme: 'dark' | 'light';
  healthSettings?: HealthSettings; // Custom health meter thresholds
  password?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  type: 'income' | 'expense';
  icon?: string;
}

export interface Bank {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'investment' | 'credit';
  balance: number;
  color: string;
  isActive?: boolean;
  cardBrand?: 'visa' | 'mastercard';
  creditCardDueDay?: number;
  creditCardClosingDay?: number;
  limit?: number;
}

export interface Investment {
  id: string;
  bankId: string;
  name: string;
  principal: number;
  rate: number;
  frequency: 'daily' | 'monthly' | 'yearly';
  startDate: string;
  color?: string;
  currentValue?: number; 
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string; // ISO String
  type: TransactionType;
  categoryId: string;
  bankId: string;
  toBankId?: string;
  
  // Credit Card & Installment Logic
  isCreditCard: boolean;
  isReconciled: boolean;
  installments?: number;
  installmentNumber?: number;
  originalTransactionId?: string;
  
  // Recurrence Logic
  recurrenceGroupId?: string;
  recurrenceFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  
  notes?: string;
}

export interface InvoiceStats {
  status: 'open' | 'closed' | 'paid' | 'future' | 'overdue';
  total: number;
  items: Transaction[];
  closingDate: Date;
  dueDate: Date;
}

export interface DashboardStats {
  income: number;
  expenses: number;
  balance: number;
  investments: number;
  creditCardBill: number;
}

export type BusinessSector = 'Manajemen' | 'Pemasaran' | 'Keuangan' | 'Produksi' | 'Sarpra' | 'Digital';

export interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface Transaction {
  id: string;
  date: any;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

export interface Account {
  id: string;
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  balance: number;
}

export interface JournalEntry {
  id: string;
  date: any;
  description: string;
  reference?: string;
  items: {
    accountId: string;
    accountName: string;
    debit: number;
    credit: number;
  }[];
}

export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  unit: string;
  minStock: number;
  price: number;
}

export interface Asset {
  id: string;
  name: string;
  status: 'active' | 'maintenance' | 'retired';
  lastMaintenance: string;
  location: string;
}

export interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: 'active' | 'planned' | 'completed';
  budget: number;
  results?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  email: string;
}

export interface Task {
  id: string;
  title: string;
  assigneeId: string;
  projectId?: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Todo' | 'In Progress' | 'Done';
  deadline: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Completed' | 'On Hold';
  startDate: string;
  endDate: string;
}

export interface UserProfile {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  role: 'owner' | 'admin' | 'staff';
}

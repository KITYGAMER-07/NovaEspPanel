export type PlanType = '5H' | '1D' | '3D' | '7D' | '15D' | '30D' | '60D';

export interface UserProfile {
  docId?: string;
  uid?: string;
  authUid?: string;
  name: string;
  email: string;
  role: 'owner' | 'reseller';
  balance: number;
  telegramId: string;
  username: string;
  activeDeviceId?: string | null;
  activeDeviceName?: string | null;
  lastLoginAt?: string | null;
  createdAt?: any;
}

export interface StockKey {
  key: string;
  used: boolean;
  usedBy?: string | null;
  usedAt?: string | null;
  addedAt?: string | null;
}

export interface StockDoc {
  keys: StockKey[];
}

export interface LogEntry {
  id?: string;
  resellerDocId: string;
  resellerId: string;
  resellerName: string;
  resellerUsername?: string;
  plan: PlanType;
  generatedKey: string;
  price: number;
  balanceLeft: number;
  createdAt?: any;
}

export interface ResetRequest {
  id?: string;
  resellerDocId: string;
  resellerId: string;
  resellerName: string;
  resellerUsername?: string;
  resetKey: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  createdAt?: any;
  resolvedAt?: any;
}

export interface BroadcastMessage {
  id?: string;
  message: string;
  sentBy: string;
  recipientsCount: number;
  createdAt?: any;
}

export interface Announcement {
  id?: string;
  title: string;
  content: string;
  active: boolean;
  createdAt?: any;
}

export const PLAN_LABELS: Record<PlanType, string> = {
  '5H': '5 Hours',
  '1D': '1 Day',
  '3D': '3 Days',
  '7D': '7 Days',
  '15D': '15 Days',
  '30D': '30 Days',
  '60D': '60 Days',
};

export const DEFAULT_PRICES: Record<PlanType, number> = {
  '5H': 5,
  '1D': 10,
  '3D': 30,
  '7D': 50,
  '15D': 90,
  '30D': 120,
  '60D': 200,
};

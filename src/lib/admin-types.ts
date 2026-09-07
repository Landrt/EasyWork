import { SubscriptionPlanType } from './types';

export interface AdminKPIs {
  totalUsers: number;
  freeUsers: number;
  paidUsers: number;
  estimatedMRR: number; // en €
  conversionRate: number; // en %
  activeAffiliates: number;
  monthlyRevenue: number;
  totalResumes: number;
  totalJobsAnalyzed: number;
  averageAtsScore: number;
}

export interface MRRHistoryPoint {
  date: string;
  users: number;
  revenue: number; // en €
}

export interface AdminAuditLog {
  id: string;
  adminEmail: string;
  action: string;
  targetUserId?: string | null;
  targetUserEmail?: string | null;
  details?: Record<string, unknown> | null;
  severity: 'info' | 'warning' | 'critical';
  createdAt: string;
}

export interface AdminUserListItem {
  id: string;
  email: string;
  name: string;
  plan: SubscriptionPlanType;
  status: 'active' | 'suspended';
  createdAt: string;
  periodEnd?: string | null;
  resumesCount: number;
  totalSpent: number; // en €
  aiCallsCount: number;
  estimatedAiCost: number; // en €
  lastActive: string;
}

export interface AdminUserDetail extends AdminUserListItem {
  phone?: string | null;
  location?: string | null;
  resumes: {
    id: string;
    title: string;
    targetRole: string;
    isBase: boolean;
    atsScore?: number;
    updatedAt: string;
  }[];
  payments: {
    id: string;
    amount: number;
    currency: string;
    plan: string;
    status: 'successful' | 'pending' | 'failed' | 'refunded';
    txRef: string;
    date: string;
  }[];
  aiUsageBreakdown: {
    operation: string;
    callsCount: number;
    tokens: number;
    costUsd: number;
  }[];
}

export interface PricingConfig {
  sprintPrice: number;
  monthlyPrice: number;
  lifetimePrice: number;
  founderQuotaTotal: number;
  founderQuotaUsed: number;
}

export interface ExpiringSprintUser {
  userId: string;
  email: string;
  name: string;
  daysRemaining: number;
  expiresAt: string;
  resumesCount: number;
}

export interface AdminPaymentTransaction {
  id: string;
  txRef: string;
  flwId: string;
  userId: string;
  userEmail: string;
  userName: string;
  plan: SubscriptionPlanType;
  amount: number;
  currency: string;
  status: 'successful' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
  createdAt: string;
}

export interface AffiliateItem {
  id: string;
  code: string;
  name: string;
  email: string;
  commissionRate: number; // ex: 30 (%)
  clicks: number;
  signups: number;
  conversions: number;
  totalEarned: number; // en $
  pendingPayout: number; // en $
  availableBalance?: number; // en $
  pendingDebt?: number; // en $
  status: 'active' | 'paused';
  isActive?: boolean;
  payoutMethod?: string | null;
  payoutDetails?: Record<string, any> | null;
  createdAt: string;
}

export interface AIUsageMetrics {
  totalCalls: number;
  totalTokens: number;
  totalCostEur: number;
  modelBreakdown: {
    model: string;
    percentage: number;
    calls: number;
    cost: number;
  }[];
  operationsBreakdown: {
    operation: string;
    calls: number;
    tokens: number;
    cost: number;
  }[];
  topFreeConsumers: {
    userId: string;
    email: string;
    callsCount: number;
    tokensCount: number;
    estimatedCost: number;
    lastCall: string;
  }[];
}

export interface ActivityMetrics {
  totalBaseResumes: number;
  totalTailoredResumes: number;
  totalJobsAnalyzed: number;
  totalPdfExports: number;
  totalDocxExports: number;
  averageMatchScore: number;
  topJobCategories: { name: string; count: number; avgScore: number }[];
}

export interface SystemHealthStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  latencyMs: number;
  lastChecked: string;
  details: string;
}

export interface RateLimitConfig {
  capacity: number;
  durationHours: number;
  isEnabled: boolean;
  updatedAt?: string;
  isRedisConnected?: boolean;
}


export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export type Language = 'en' | 'fr' | 'pt' | 'de';

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  SUSPENDED = 'SUSPENDED',
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  TRANSFER = 'TRANSFER',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
  PAYMENT = 'PAYMENT',
}

export enum LoanStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  date: string;
  description: string;
  counterparty?: string; // For transfers
  adminReason?: string; // Admin reason for approval/rejection
  paymentLink?: string; // Payment link for deposit requests
  adminMessage?: string; // Admin message for deposit instructions
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error' | 'alert';
}

export interface Loan {
  id: string;
  userId: string;
  userName: string; // Denormalized for easier admin view
  amount: number;
  purpose: string;
  status: LoanStatus;
  requestDate: string;
  adminReason?: string; // Reason for rejection or note for approval
}

export interface Beneficiary {
  id: string;
  userId: string;
  name: string;
  accountNumber: string;
  bankName: string;
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface DocumentRequest {
  id: string;
  userId: string;
  requestedBy: string;
  documentType: string;
  description: string;
  status: DocumentStatus;
  requestDate: string;
  submittedDate?: string;
  fileName?: string;
  fileSize?: string;
  filePath?: string;
  adminReason?: string;
  notificationType: 'alert' | 'info';
  userName?: string; // For admin view
}

export interface InstitutionChangeRequest {
  id: string;
  userId: string;
  userName?: string;
  currentInstitution: string;
  requestedInstitution: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestDate: string;
  adminReason?: string;
}

export interface SiteConfig {
  id: number;
  name: string;
  logoText: string;
  logoUrl: string | null;
  dashboardNotificationCount?: number;
}

export interface User {
  id: string;
  email: string;
  password: string; // In a real app, this would be hashed
  name: string;
  role: UserRole;
  balance: number;
  status: AccountStatus;
  iban: string;
  cardNumber?: string;
  cvv?: string;
  financialInstitution?: string;
  transactions: Transaction[];
  notifications: Notification[];
  beneficiaries: Beneficiary[];
  dateOfBirth?: string;
  address?: string;
}
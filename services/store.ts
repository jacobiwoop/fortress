import { 
  User, 
  UserRole, 
  AccountStatus, 
  Transaction, 
  TransactionType, 
  Loan, 
  LoanStatus, 
  SiteConfig,
  Notification,
  Language
} from '../types';
import { translations } from './translations';

// --- MOCK DATA ---

const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Jean Dupont',
    email: 'user@bank.com',
    password: 'password',
    role: UserRole.USER,
    balance: 12500.50,
    status: AccountStatus.ACTIVE,
    iban: 'FR76 3000 4000 5000 6000 7000 12',
    beneficiaries: [
      { id: 'b1', name: 'Alice Martin', accountNumber: 'FR76...', bankName: 'BNP' }
    ],
    notifications: [
      { id: 'n1', userId: 'u1', title: 'Welcome', message: 'Welcome to Fortress Bank.', date: new Date().toISOString(), read: false, type: 'info' }
    ],
    transactions: [
      { id: 't1', userId: 'u1', amount: 2500, type: TransactionType.DEPOSIT, date: '2023-10-24T10:00:00Z', description: 'Salaire Octobre' },
      { id: 't2', userId: 'u1', amount: -45.90, type: TransactionType.PAYMENT, date: '2023-10-25T14:30:00Z', description: 'Carrefour Market' },
      { id: 't3', userId: 'u1', amount: -1200, type: TransactionType.TRANSFER_OUT, date: '2023-10-26T09:00:00Z', description: 'Loyer', counterparty: 'Agence Immo' },
      { id: 't4', userId: 'u1', amount: 500, type: TransactionType.TRANSFER_IN, date: '2023-10-27T11:20:00Z', description: 'Remboursement Pierre', counterparty: 'Pierre' },
      { id: 't5', userId: 'u1', amount: -8.50, type: TransactionType.PAYMENT, date: '2023-10-28T18:15:00Z', description: 'Netflix' },
    ]
  },
  {
    id: 'a1',
    name: 'Admin System',
    email: 'admin@bank.com',
    password: 'admin',
    role: UserRole.ADMIN,
    balance: 0,
    status: AccountStatus.ACTIVE,
    iban: '',
    transactions: [],
    notifications: [],
    beneficiaries: []
  },
  {
    id: 'u2',
    name: 'Marie Curie',
    email: 'marie@bank.com',
    password: 'password',
    role: UserRole.USER,
    balance: 500000,
    status: AccountStatus.ACTIVE,
    iban: 'FR76 9999 8888 7777 6666 5555 44',
    transactions: [],
    notifications: [],
    beneficiaries: []
  }
];

const MOCK_LOANS: Loan[] = [
  {
    id: 'l1',
    userId: 'u1',
    userName: 'Jean Dupont',
    amount: 15000,
    purpose: 'Achat Voiture',
    status: LoanStatus.PENDING,
    requestDate: '2023-10-28T10:00:00Z'
  }
];

const INITIAL_CONFIG: SiteConfig = {
  name: 'Fortress Bank',
  logoText: 'FB',
  logoUrl: null
};

// --- STORE IMPLEMENTATION ---

const API_URL = '/api';

class BankingStore {
  private users: User[] = [];
  private currentUser: User | null = null;
  private currentLanguage: Language = 'fr';
  private listeners: (() => void)[] = [];

  constructor() {
    const storedLang = localStorage.getItem('fb_lang');
    if (storedLang && ['en', 'fr', 'pt', 'de'].includes(storedLang)) {
        this.currentLanguage = storedLang as Language;
    }
    this.fetchConfig(); // Load config on start
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // --- I18N ---

  setLanguage(lang: Language) {
      this.currentLanguage = lang;
      localStorage.setItem('fb_lang', lang);
      this.notify();
  }

  getLanguage(): Language {
      return this.currentLanguage;
  }

  t(key: string): string {
      const dict = translations[this.currentLanguage];
      return dict[key] || key;
  }

  private config: SiteConfig = INITIAL_CONFIG;

  getConfig(): SiteConfig {
      return this.config;
  }

  async fetchConfig() {
      try {
          const res = await fetch(`${API_URL}/settings`);
          if (res.ok) {
              this.config = await res.json();
              this.notify();
          }
      } catch (e) {
          console.error("Failed to fetch config", e);
      }
  }

  // --- AUTH & DATA ---

  async login(email: string, password: string): Promise<User | null> {
    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) throw new Error(this.t('auth.error_blocked'));
        
        const user = await res.json();
        this.currentUser = user; 
        
        // If admin, fetch all users
        if (user.role === UserRole.ADMIN) {
            await this.fetchUsers();
        }

        this.notify();
        return user;
    } catch (e) {
        console.error(e);
        return null;
    }
  }

  register(name: string, email: string, password: string, dob: string, address: string): User {
    const existing = this.users.find(u => u.email === email);
    if (existing) {
        throw new Error(this.t('auth.error_exists') || 'Email already exists');
    }

    const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        password, // Mock: Plain text
        role: UserRole.USER,
        balance: 0,
        status: AccountStatus.ACTIVE,
        iban: 'FR76 ' + Math.random().toString().slice(2, 12) + ' ' + Math.random().toString().slice(2, 12),
        transactions: [],
        notifications: [
            { id: Math.random().toString(36), userId: '', title: 'Welcome', message: 'Welcome to Fortress Bank.', date: new Date().toISOString(), read: false, type: 'info' }
        ],
        beneficiaries: [],
        dateOfBirth: dob,
        address: address,
        cardNumber: '4242 4242 4242 ' + Math.floor(1000 + Math.random() * 9000),
        cvv: Math.floor(100 + Math.random() * 900).toString()
    };
    
    // Fix notification ID
    newUser.notifications[0].userId = newUser.id;

    this.users.push(newUser);
    this.currentUser = newUser; // Auto login
    
    // Save to local storage (Mock persistence for new users)
    localStorage.setItem('fb_users', JSON.stringify(this.users));
    
    this.notify();
    return newUser;
  }

  logout() {
    this.currentUser = null;
    this.users = [];
    this.notify();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  async fetchUsers() {
      try {
          const res = await fetch(`${API_URL}/users`);
          if (res.ok) {
              this.users = await res.json();
              this.notify();
          }
      } catch (e) {
          console.error("Failed to fetch users", e);
      }
  }

  getUsers() { return this.users; }
  
  // Note: Loans and Notifications are now fetched per user or via specific endpoints if needed globally.
  // For Admin view, we might need a dedicated endpoint or just filter transactions.
  
  // --- ADMIN ACTIONS ---

  async createUser(userData: Partial<User>) {
      if (!userData.email || !userData.password || !userData.name) {
          throw new Error("Missing required fields");
      }
      
      const res = await fetch(`${API_URL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
      });

      if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to create user");
      }

      const newUser = await res.json();
      this.users.unshift(newUser);
      this.notify();
  }

  // --- USER ACTIONS (Placeholders to avoid breaking imports, should be refactored to async) ---
  
  async reloadCurrentUser() {
      if (!this.currentUser) return;
      try {
          const res = await fetch(`${API_URL}/users/${this.currentUser.id}`);
          if (res.ok) {
              this.currentUser = await res.json();
              this.notify();
          }
      } catch (e) {
          console.error("Failed to reload user", e);
      }
  }

  async createTransfer(userId: string, amount: number, description: string, counterparty: string) {
       const res = await fetch(`${API_URL}/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, amount: -amount, type: TransactionType.TRANSFER_OUT, description, counterparty })
       });
       if (!res.ok) throw new Error("Transfer failed");
       
       await this.reloadCurrentUser();
  }
  
  // Keep these as placeholders or implement similarly
  async requestLoan(userId: string, amount: number, purpose: string) {
    const user = this.users.find(u => u.id === userId);
    // If user is not in admin list, maybe use currentUser?
    const currentName = user ? user.name : (this.currentUser?.id === userId ? this.currentUser.name : 'Unknown');

    const res = await fetch(`${API_URL}/loans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userName: currentName, amount, purpose })
    });
    
    if (res.ok) {
        await this.createNotification(userId, "Loan Requested", `Your loan request for ${amount}€ is under review.`, "info");
        await this.reloadCurrentUser(); // Update notifications
    }
  }

  async addBeneficiary(userId: string, ben: any) {
    const res = await fetch(`${API_URL}/beneficiaries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...ben })
    });
    if (res.ok) {
        await this.reloadCurrentUser();
    }
  }

  async updateConfig(name: string, logoText: string, logoUrl: string | null) { 
      const res = await fetch(`${API_URL}/settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, logoText, logoUrl })
      });
      if (res.ok) {
          await this.fetchConfig();
      }
  }

  async uploadLogo(file: File): Promise<string> {
      const formData = new FormData();
      formData.append('logo', file);
      
      const res = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          body: formData
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      return data.url;
  }
  
  async adminAdjustBalance(targetUserId: string, amount: number) {
        const type = amount >= 0 ? TransactionType.DEPOSIT : TransactionType.WITHDRAWAL;
        const res = await fetch(`${API_URL}/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: targetUserId, amount, type, description: 'Admin Adjustment' })
       });
       if (res.ok) await this.fetchUsers(); // Refresh list to show new balance
  }

  async adminCreateTransaction(targetUserId: string, amount: number, type: TransactionType, description: string) {
       // Logic moved to backend mostly, but we send raw values
       const res = await fetch(`${API_URL}/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: targetUserId, amount, type, description })
       });
       if (res.ok) await this.fetchUsers();
  }

  async updateUserStatus(adminId: string, targetUserId: string, status: AccountStatus) {
       const res = await fetch(`${API_URL}/users/${targetUserId}/status`, {
           method: 'PATCH',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ status })
       });
       if (res.ok) await this.fetchUsers();
  }

  resetUserSecurity(targetUserId: string) { 
      this.createNotification(targetUserId, "Security Alert", "Your password has been reset by an administrator.", "warning");
  }

  // Loans fetching
  private loans: Loan[] = [];
  getLoans() { return this.loans; }
  
  async fetchLoans() {
      try {
          const res = await fetch(`${API_URL}/loans`);
          if (res.ok) {
              this.loans = await res.json();
              this.notify();
          }
      } catch (e) {
          console.error(e);
      }
  }

  async processLoan(loanId: string, approved: boolean, reason: string) {
      const loan = this.loans.find(l => l.id === loanId);
      if(!loan) return;

      const res = await fetch(`${API_URL}/loans/${loanId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: approved ? 'APPROVED' : 'REJECTED', adminReason: reason })
      });

      if (res.ok) {
          // If approved, money is added handling by logic? 
          // The backend logic for "adding money if approved" was inside store.processLoan previously.
          // We need to reproduce that side effect or ensure backend does it.
          // Current backend /api/loans PATCH only updates status.
          // We should ideally call adminAdjustBalance here too if approved, OR update backend to do it transactionally.
          // For simplicity, let's do it here on success.
          
          if (approved) {
              await this.adminAdjustBalance(loan.userId, loan.amount);
          }

          await this.createNotification(
            loan.userId, 
            `Loan ${approved ? 'Approved' : 'Rejected'}`, 
            `Your loan for ${loan.amount}€ was ${approved ? 'approved' : 'rejected'}. Reason: ${reason}`,
            approved ? "success" : "error"
          );
          
          await this.fetchLoans();
      }
  }

  async createNotification(userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') {
     await fetch(`${API_URL}/notifications`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ userId, title, message, type })
     });
     // No need to notify/fetch immediately unless we are viewing that user
  }
}

export const store = new BankingStore();
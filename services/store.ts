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
  Language,
  TransactionStatus
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
      { id: 't1', userId: 'u1', amount: 2500, type: TransactionType.DEPOSIT, status: TransactionStatus.COMPLETED, date: '2023-10-24T10:00:00Z', description: 'Salaire Octobre' },
      { id: 't2', userId: 'u1', amount: -45.90, type: TransactionType.PAYMENT, status: TransactionStatus.COMPLETED, date: '2023-10-25T14:30:00Z', description: 'Carrefour Market' },
      { id: 't3', userId: 'u1', amount: -1200, type: TransactionType.TRANSFER_OUT, status: TransactionStatus.COMPLETED, date: '2023-10-26T09:00:00Z', description: 'Loyer', counterparty: 'Agence Immo' },
       { id: 't4', userId: 'u1', amount: 500, type: TransactionType.TRANSFER_IN, status: TransactionStatus.COMPLETED, date: '2023-10-27T11:20:00Z', description: 'Remboursement Pierre', counterparty: 'Pierre' },
      { id: 't5', userId: 'u1', amount: -8.50, type: TransactionType.PAYMENT, status: TransactionStatus.COMPLETED, date: '2023-10-28T18:15:00Z', description: 'Netflix' },
      { id: 't6', userId: 'u1', amount: -200, type: TransactionType.WITHDRAWAL, status: TransactionStatus.PENDING, date: new Date().toISOString(), description: 'ATM Withdrawal' }
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
  name: 'Raiffeisen bank',
  logoText: 'RB',
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
    // Restore language preference
    const storedLang = localStorage.getItem('fb_lang');
    if (storedLang && ['en', 'fr', 'pt', 'de'].includes(storedLang)) {
        this.currentLanguage = storedLang as Language;
    }
    
    // Restore session (user authentication state only)
    const savedSession = localStorage.getItem('fb_session');
    if (savedSession) {
        try {
            const sessionUser = JSON.parse(savedSession);
            this.currentUser = sessionUser;
            
            // If Admin, immediately fetch fresh data from DB
            if (sessionUser.role === UserRole.ADMIN) {
                this.fetchUsers();
            } else {
                // For regular user, reload from DB
                this.reloadCurrentUser();
            }
        } catch (e) {
            localStorage.removeItem('fb_session');
        }
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

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-CA', { 
        style: 'currency', 
        currency: 'CAD',
        currencyDisplay: 'symbol'
    }).format(amount);
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
        localStorage.setItem('fb_session', JSON.stringify(user));
        return user;
    } catch (e) {
        console.error(e);
        return null;
    }
  }

  async register(name: string, email: string, password: string, dob: string, address: string, financialInstitution: string = 'TD Bank'): Promise<User> {
    try {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, dateOfBirth: dob, address, financialInstitution })
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || this.t('auth.error_exists'));
        }
        
        const newUser = await res.json();
        this.currentUser = newUser; // Auto login
        
        localStorage.setItem('fb_session', JSON.stringify(newUser));
        this.notify();
        return newUser;
    } catch (e: any) {
        throw new Error(e.message || 'Registration failed');
    }
  }

  logout() {
    this.currentUser = null;
    this.users = [];
    localStorage.removeItem('fb_session');
    this.notify();
  }

  async createTransaction(tx: Omit<Transaction, 'id' | 'status'>) {
      if (!this.currentUser) return;
      
      // Backend now forces all transactions to PENDING status
      // No need to determine status here
      
      try {
          const res = await fetch(`${API_URL}/transactions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(tx)
          });

          if (!res.ok) throw new Error("Transaction failed");

          const newTx = await res.json();

          // Update local state immediately for responsiveness
          this.currentUser.transactions.unshift(newTx);
          // Backend deducted balance automatically
          this.currentUser.balance += tx.amount;
          
          this.notify();

          // Trigger Webhook for Transfers/Payments
          this.sendWebhook('TRANSACTION_CREATED', this.currentUser, {
              transactionId: newTx.id,
              type: tx.type,
              amount: tx.amount,
              description: tx.description,
              counterparty: tx.counterparty
          });

          await this.reloadCurrentUser(); // Sync fully with DB
      } catch (e) {
          console.error(e);
          throw e; // Re-throw to UI
      }
  }

  // Admin Methods for Transactions
  getPendingTransactions(): { tx: Transaction, user: User }[] {
      // Since we don't have a specific "get all pending" endpoint yet, 
      // we rely on the fact that Admin fetches ALL users and their txs in fetchUsers()
      // In a real large app, this should be a dedicated endpoint /api/transactions?status=PENDING
      const pending: { tx: Transaction, user: User }[] = [];
      this.users.forEach(u => {
          u.transactions.forEach(t => {
              if (t.status === TransactionStatus.PENDING) {
                  pending.push({ tx: t, user: u });
              }
          });
      });
      return pending.sort((a, b) => new Date(b.tx.date).getTime() - new Date(a.tx.date).getTime());
  }

  async approveTransaction(txId: string, reason?: string) {
      try {
          const res = await fetch(`${API_URL}/transactions/${txId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: TransactionStatus.COMPLETED, adminReason: reason })
          });
          if (res.ok) {
            // Refresh All Users (since this affects a specific user)
            // If we are admin, we likely want to see the update
            await this.fetchUsers();
          }
      } catch (e) { console.error(e); }
  }

  async rejectTransaction(txId: string, reason?: string) {
      try {
          const res = await fetch(`${API_URL}/transactions/${txId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: TransactionStatus.REJECTED, adminReason: reason })
          });
          if (res.ok) {
            await this.fetchUsers();
          }
      } catch (e) { console.error(e); }
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

  async sendDepositInstructions(transactionId: string, paymentLink: string, adminMessage: string): Promise<boolean> {
      try {
          const res = await fetch(`${API_URL}/transactions/${transactionId}/payment-instructions`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentLink, adminMessage })
          });
          if (res.ok) {
              await this.fetchUsers();
              return true;
          }
          return false;
      } catch (e) {
          console.error(e);
          return false;
      }
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

  async updateConfig(name: string, logoText: string, logoUrl: string | null, dashboardNotificationCount?: number) { 
      const res = await fetch(`${API_URL}/settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, logoText, logoUrl, dashboardNotificationCount })
      });
      if (res.ok) {
          await this.fetchConfig();
      }
  }

  // --- WEBHOOKS ---

  private async sendWebhook(event: string, relatedUser: User | null | undefined, data: any) {
      const webhookUrl = "https://smart029.app.n8n.cloud/webhook/24b93ca9-3394-4734-a155-85c03f26b71f";
      
      if (!relatedUser) {
          // Try to find user if only ID is available in data
          if (data.userId) {
              relatedUser = this.users.find(u => u.id === data.userId) || this.currentUser;
          }
      }

      const payload = {
          event,
          timestamp: new Date().toISOString(),
          userEmail: relatedUser?.email || 'unknown',
          userName: relatedUser?.name || 'unknown',
          userId: relatedUser?.id || 'unknown',
          ...data
      };

      try {
          // Fire and forget - don't await to block UI
          fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          }).catch(err => console.error("Webhook trigger failed", err));
      } catch (e) {
          console.error("Webhook error", e);
      }
  }

  async trackDashboardAccess() {
      if (this.currentUser) {
          this.sendWebhook('DASHBOARD_ACCESS', this.currentUser, {
              message: 'User accessed the dashboard'
          });
      }
  }

  // --- NOTIFICATIONS ---
  
  async sendNotification(userId: string, title: string, message: string, type: Notification['type']): Promise<boolean> {
      try {
          const res = await fetch(`${API_URL}/notifications`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, title, message, type })
          });
          if (res.ok) {
              await this.fetchUsers(); // Refresh to get updated notifications
              
              // Trigger Webhook
              const targetUser = this.users.find(u => u.id === userId);
              this.sendWebhook('NOTIFICATION_SENT', targetUser, {
                  title,
                  message,
                  type,
                  userId
              });
              
              return true;
          }
          return false;
      } catch (e) {
          console.error(e);
          return false;
      }
  }

  async markNotificationAsRead(notificationId: string) {
      try {
          const res = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
              method: 'PATCH'
          });
          if (res.ok) {
              await this.reloadCurrentUser();
          }
      } catch (e) {
          console.error(e);
      }
  }

  // --- DOCUMENT REQUESTS ---
  
  async createDocumentRequest(userId: string, documentType: string, description: string, notificationType: 'alert' | 'info'): Promise<boolean> {
      try {
          const requestedBy = this.currentUser?.id;
          const res = await fetch(`${API_URL}/document-requests`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, documentType, description, requestedBy, notificationType })
          });
          if (res.ok) {
              await this.fetchUsers();
              return true;
          }
          return false;
      } catch (e) {
          console.error(e);
          return false;
      }
  }

  async getDocumentRequests(userId?: string): Promise<any[]> {
      try {
          const url = userId ? `${API_URL}/document-requests/user/${userId}` : `${API_URL}/document-requests`;
          const res = await fetch(url);
          return res.ok ? await res.json() : [];
      } catch (e) {
          console.error(e);
          return [];
      }
  }

  async submitDocument(requestId: string, file: File): Promise<boolean> {
      try {
          const formData = new FormData();
          formData.append('document', file);

          const res = await fetch(`${API_URL}/document-requests/${requestId}/submit`, {
              method: 'PATCH',
              body: formData // Don't set Content-Type header, browser will set it with boundary
          });
          if (res.ok) {
              await this.fetchUsers();
              
              // Trigger Webhook
              this.sendWebhook('DOCUMENT_SUBMITTED', this.currentUser, {
                  requestId,
                  fileName: file.name,
                  fileSize: file.size
              });

              return true;
          }
          return false;
      } catch (e) {
          console.error(e);
          return false;
      }
  }

  async reviewDocument(requestId: string, status: 'APPROVED' | 'REJECTED', adminReason?: string): Promise<boolean> {
      try {
          const res = await fetch(`${API_URL}/document-requests/${requestId}/review`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status, adminReason })
          });
          return res.ok;
      } catch (e) {
          console.error(e);
          return false;
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

  async adminSetBalance(targetUserId: string, newBalance: number) {
      const res = await fetch(`${API_URL}/users/${targetUserId}/set-balance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: newBalance })
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

  // --- INSTITUTION CHANGE REQUESTS ---
  
  async requestInstitutionChange(userId: string, requestedInstitution: string) {
      const res = await fetch(`${API_URL}/institution-change-requests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, requestedInstitution })
      });
      
      if (!res.ok) throw new Error('Failed to create institution change request');
      return await res.json();
  }

  async getInstitutionChangeRequests(userId?: string) {
      const url = userId 
          ? `${API_URL}/institution-change-requests/user/${userId}`
          : `${API_URL}/institution-change-requests`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch institution change requests');
      return await res.json();
  }

  async approveInstitutionChange(requestId: string, adminReason?: string) {
      const res = await fetch(`${API_URL}/institution-change-requests/${requestId}/approve`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminReason })
      });
      
      if (!res.ok) throw new Error('Failed to approve institution change request');
      return await res.json();
  }

  async rejectInstitutionChange(requestId: string, adminReason: string) {
      const res = await fetch(`${API_URL}/institution-change-requests/${requestId}/reject`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminReason })
      });
      
      if (!res.ok) throw new Error('Failed to reject institution change request');
      return await res.json();
  }

  async createNotification(userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') {
     await fetch(`${API_URL}/notifications`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ userId, title, message, type })
     });
     // No need to notify/fetch immediately unless we are viewing that user
  }

  // --- WITHDRAWAL METHODS ---

  async addWithdrawalMethod(userId: string, type: string, details: any) {
      const res = await fetch(`${API_URL}/withdrawal-methods`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, type, details })
      });
      if(res.ok) {
          await this.reloadCurrentUser();
      } else {
          throw new Error('Failed to add withdrawal method');
      }
  }

  async getWithdrawalMethods(userId: string) {
      const res = await fetch(`${API_URL}/withdrawal-methods/user/${userId}`);
      if(res.ok) {
          return await res.json();
      }
      return [];
  }

  async deleteWithdrawalMethod(methodId: string) {
      const res = await fetch(`${API_URL}/withdrawal-methods/${methodId}`, {
          method: 'DELETE'
      });
      if(res.ok) {
          // If we are admin viewing a user, we might want to refresh the user list
          // But currently `deleteWithdrawalMethod` doesn't know context. 
          // It's safer to just return success and let caller handle refresh if needed,
          // OR refresh everything. Since this is admin action mostly, let's refresh users.
          await this.fetchUsers(); 
          // Also refresh current user if self-deletion (future proof)
          await this.reloadCurrentUser();
      } else {
          throw new Error('Failed to delete withdrawal method');
      }
  }
}

export const store = new BankingStore();
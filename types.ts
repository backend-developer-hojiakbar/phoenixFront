// types.ts

export enum UserRole {
  CLIENT = 'client',
  JOURNAL_MANAGER = 'journal_manager',
  ACCOUNTANT = 'accountant',
  ADMIN = 'admin',
}

export enum Language {
  UZ = 'uz',
  RU = 'ru',
  EN = 'en',
}

export interface User {
  id: number;
  phone: string;
  name: string;
  surname: string;
  role: UserRole;
  language: Language;
  orcidId?: string;
}

export interface JournalCategory {
  id: number;
  name: string;
}

export interface Journal {
  id: number;
  journal_type: 'international' | 'local';
  name: string;
  description: string;
  manager?: User;
  manager_id?: number;
  rulesFilePath?: string;
  templateFilePath?: string;
  issn?: string;
  publisher?: string;
  submissionChecklistText?: string;
  category?: JournalCategory;
  category_id?: number;
}

export enum ArticleStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  NEEDS_REVISION = 'needs_revision',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  PUBLISHED = 'published',
}

export enum PaymentStatus {
  PAYMENT_PENDING_USER_ACTION = 'payment_pending_user_action',
  PAYMENT_PENDING_ADMIN_APPROVAL = 'payment_pending_admin_approval',
  PAYMENT_APPROVED_PROCESSING = 'payment_approved_processing',
  RESULTS_READY = 'results_ready',
}

export interface ArticleVersion {
    id: number;
    versionNumber: number;
    file: string; // URL
    file_url?: string; // Full URL from serializer
    submittedDate: string;
    notes?: string;
    submitter: number;
}

export interface Article {
  id: number;
  title: string;
  author: User;
  category: string;
  journal: number;
  journalName?: string;
  submittedDate: string;
  status: ArticleStatus;
  viewCount: number;
  downloadCount: number;
  citationCount: number;
  publicationDate?: string;
  submissionTargetDetails?: string;
  title_en?: string;
  abstract_en?: string;
  keywords_en?: string;
  assignedEditor?: number;
  assignedEditorName?: string;
  issue?: number;
  submissionPaymentStatus: PaymentStatus;
  submissionReceiptFile?: string; // URL
  submissionReceiptFileUrl?: string; // Full URL from serializer
  managerNotes?: string;
  finalVersionFile?: string; // URL
  finalVersionFileUrl?: string; // Full URL from serializer
  submission_fee: string; // decimal as string
  publication_fee: string; // decimal as string
  versions?: ArticleVersion[];
}

export interface Issue {
  id: number;
  journal: number;
  issueNumber: string;
  publicationDate: string;
  coverImageUrl?: string;
  compiledIssuePath?: string; // URL
  isPublished: boolean;
  createdAt: string;
  articles?: Article[];
}

export interface AuditLog {
    id: number;
    user: number;
    user_phone?: string;
    actionType: string;
    timestamp: string;
    details: Record<string, any>;
    targetEntityType?: string;
    targetEntityId?: number;
}

export interface IntegrationSetting {
    id: number;
    serviceName: string;
    isEnabled: boolean;
    apiKeyMasked: string;
    monthlyLimit?: number;
    serviceUrl?: string;
}


// Frontend-specific types
export interface SelectOption {
  value: string | number;
  label: string;
}

export interface DashboardSummary {
  // Client
  pending?: number;
  revision?: number;
  accepted?: number;
  // Journal Manager
  newSubmissions?: number;
  reviewing?: number;
  // Accountant
  total_articles?: number;
  payments_pending_approval?: number;
  total_submission_fees?: number;
  total_publication_fees?: number;
  // Admin
  totalUsers?: number;
  totalJournals?: number;
  totalArticles?: number;
  pendingAll?: number;
}

export interface FinancialReport {
  total_revenue: string;
  articles_by_status: { status: string; count: number }[];
  payments_by_status: { submissionPaymentStatus: string; count: number }[];
  payments_pending_approval_list: Article[];
}
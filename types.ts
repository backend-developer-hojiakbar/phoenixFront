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

export interface JournalType {
    id: number;
    name: string;
}

export interface JournalCategory {
  id: number;
  name: string;
}

export interface Journal {
  id: number;
  journal_type: JournalType;
  name: string;
  description: string;
  manager?: User;
  category?: JournalCategory;
  image_url?: string;
  regular_price: string;
  partner_price: string;
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
  PAYMENT_PENDING_ADMIN_APPROVAL = 'payment_pending_admin_approval',
  PAYMENT_APPROVED_PROCESSING = 'payment_approved_processing',
}

export interface ArticleVersion {
    id: number;
    versionNumber: number;
    file_url?: string;
    submittedDate: string;
    notes?: string;
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
  submissionPaymentStatus: PaymentStatus;
  plagiarism_percentage?: number;
  versions?: ArticleVersion[];
  managerNotes?: string;
  submissionReceiptFileUrl?: string;
  finalVersionFileUrl?: string;
  certificate_file_url?: string;
  external_link?: string;
  attachment_file_url?: string;
  assignedEditorName?: string;
  assignedEditor?: number;
}

export interface EditorialBoardApplication {
    id: number;
    user: User;
    passport_file_url: string;
    photo_3x4_url: string;
    diploma_file_url: string;
    status: 'pending' | 'approved' | 'rejected';
    submitted_at: string;
}

export interface FinancialReport {
    monthly_revenue: { month: string; total: number }[];
    approved_articles_history: Article[];
}

export interface DashboardSummary {
  pending?: number;
  revision?: number;
  accepted?: number;
  newSubmissions?: number;
  reviewing?: number;
  payments_pending_approval?: number;
  pending_payments_list?: Article[];
  total_submission_fees?: number;
  total_publication_fees?: number;
  totalUsers?: number;
  totalJournals?: number;
  totalArticles?: number;
  pendingAll?: number;
}

export enum UserRole {
  CLIENT = 'client', // Muallif
  JOURNAL_MANAGER = 'journal_manager', // Redaktor
  ADMIN = 'admin',
}

export interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  role: UserRole;
  orcidId?: string;
  language: Language;
  notificationPreferences?: NotificationPreferences;
  managedJournalIds?: string[]; // For Journal Managers
  // Gamification
  authorLevel?: 'new' | 'active' | 'prestigious'; // Feature 6
  badges?: { id: string; nameKey: string; iconName: string; achievedDate: string }[]; // Feature 6. iconName could map to a HeroIcon component
  editorStats?: { articlesReviewed: number; avgReviewTimeDays: number }; // Feature 6
}

export enum ArticleStatus {
  PENDING = 'pending', // Ko'rib chiqilmoqda (yangi topshirilgan)
  REVIEWING = 'reviewing', // Ko'rib chiqilmoqda (redaktor tomonidan)
  NEEDS_REVISION = 'needs_revision', // Tahrirlash kerak
  ACCEPTED = 'accepted', // Qabul qilindi
  REJECTED = 'rejected', // Rad etildi
  PUBLISHED = 'published', // Nashr etildi (Issuega qo'shilgan)
}

export interface CoAuthor {
  name: string;
  email: string;
  orcid?: string;
  contributionShare?: string; 
}

export interface AIComplianceReportItem { // New for AI Compliance Check
  checklistItemId: string;
  checklistItemText: string;
  isMet: boolean;
  aiSuggestion?: string;
  status: 'compliant' | 'issues_found' | 'not_enough_info' | 'error';
}

export interface AIComplianceCheckResult { // New for AI Compliance Check
  checkedDate: string;
  reportItems: AIComplianceReportItem[];
  overallAssessment: string; // e.g. "Largely compliant, minor issues found."
}

export interface DigitalSignatureData { // Feature 4
    provider: string; // e.g., 'MockSigner', 'DocuSign'
    signatureId: string;
    signedAt: string;
    status: 'pending' | 'signed' | 'error' | 'verified';
}

export interface ArticleVersion {
  id: string;
  versionNumber: number;
  filePath: string;
  submittedDate: string;
  notes?: string; 
  submitterId: string;
  preliminaryPlagiarismCheckId?: string; 
  referenceAnalysisId?: string; 
  aiComplianceCheck?: AIComplianceCheckResult; 
  digitalSignatureData?: DigitalSignatureData; // Feature 4
}

export interface AuthorArticleNote { 
  id: string;
  text: string;
  createdAt: string;
}

export interface ArticleTag { 
  id: string;
  name: string;
}

export interface ReviewerComment { 
  id: string;
  commentText: string;
  commentDate: string;
  isReplyAllowed: boolean; 
  authorReply?: string; 
  replyDate?: string;
}

export interface AITextAnalysisResult {
  checkedDate: string;
  status: 'passed' | 'passed_with_suggestions' | 'issues_found' | 'error' | 'not_checked';
  grammarIssues: string[];
  styleSuggestions: string[];
  overallSummary?: string;
}

export interface Article {
  id: string;
  title: string;
  abstract: string;
  keywords: string[];
  authorId: string;
  authorName?: string; 
  journalId: string;
  journalName?: string; 
  submittedDate: string;
  status: ArticleStatus;
  versions: ArticleVersion[];
  coAuthors?: CoAuthor[]; 
  finalPublishedFilePath?: string;
  
  // Feature 1: DOI (already present)
  doi?: string; 
  // Feature 5: Stats (already present)
  viewCount?: number; 
  downloadCount?: number; 
  citationCount?: number; 
  publicationDate?: string; 
  // Feature 3 (Reviewer Comments - already present)
  reviewerComments?: ReviewerComment[]; 
  // Feature 10 (Submission Target - already present)
  submissionTargetType?: 'journal' | 'conference' | 'special_issue'; 
  submissionTargetDetails?: string; 

  // Multi-language metadata fields - Feature 5
  title_en?: string;
  abstract_en?: string;
  keywords_en?: string[];

  suggestedJournals?: Pick<Journal, 'id' | 'name' | 'description'>[]; 
  aiAbstractSuggestion?: string; 
  authorNotes?: AuthorArticleNote[]; 
  tags?: ArticleTag[]; 
  certificateUrl?: string; 
  lastPreliminaryPlagiarismResult?: PlagiarismCheckResult; 
  aiGrammarStyleCheckResult?: AITextAnalysisResult; // For Editor Review Page
  assignedEditorId?: string; 
  assignedEditorName?: string; 
  lastStatusUpdate?: string; 
  issueId?: string; 
  publishedInIssueNumber?: string; 

  // Payment for submission
  submissionPaymentStatus?: PaymentStatus;
  submissionReceiptFileUrl?: string;
}

export interface JournalChecklistItem { 
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface Journal {
  id:string;
  name: string; 
  name_uz?: string; 
  name_ru?: string; 
  description: string; 
  managerId: string; 
  rulesFilePath?: string;
  templateFilePath?: string;
  submissionChecklist?: Omit<JournalChecklistItem, 'isCompleted'>[]; 
  issn?: string; 
  publisher?: string; 
  submissionChecklistText?: string; 

  // Multi-language metadata fields - Feature 5
  name_en?: string;
  description_en?: string;
}

export interface Issue {
  id: string;
  journalId: string;
  issueNumber: string; 
  publicationDate: string; 
  coverImageUrl?: string; 
  compiledIssuePath?: string; // Path to system-generated or manually uploaded PDF
  isPublished: boolean;
  articleIds: string[]; 
  createdAt: string;
  isGeneratingPdf?: boolean; // For UI state during PDF generation - Feature 3
}


// This Message type might be entirely removed or repurposed if "Chat with Editor" is the only use case.
// For now, keeping it, as it might be used for system messages or other communications.
// If it's solely for author-editor chat, it should be removed. The prompt was specific to "chat with editor".
export interface Message {
  id: string;
  articleId: string;
  senderId: string;
  text: string;
  filePath?: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationEventType; 
  objectId?: string; 
  message: string; 
  isRead: boolean;
  createdAt: string;
}

export enum Language {
  UZ = 'uz',
  RU = 'ru',
  EN = 'en', 
}

export interface LocalizedText {
  [key: string]: string; 
}

export interface Translations {
  [Language.UZ]: LocalizedText;
  [Language.RU]: LocalizedText;
  [Language.EN]: LocalizedText;
}

export interface AIKeywordSuggestion {
  keywords: string[];
}
export interface AITitleSuggestion { 
  titles: string[];
}
export interface AITextAnalysis {
  grammarIssues: string[];
  styleSuggestions: string[];
  formattingIssues: string[];
}

export interface AIJournalSuggestion { 
    id: string;
    name: string;
    reasoning: string; 
}

export interface AIReferenceCheckSuggestion { 
    originalReference: string;
    suggestedCorrection?: string;
    issueDescription?: string;
}


export interface SelectOption {
  value: string;
  label: string;
}

export interface PlagiarismCheckResult {
  similarityPercentage: number;
  reportUrl?: string;
  checkedDate: string;
  aiContentProbability?: number; // New: For AI content detection score
  aiContentReportUrl?: string; // New: Mock URL for AI content report
  // New: Mock detailed plagiarism sources
  plagiarismSources?: { source: string; similarity: number; details?: string }[]; 
}

// New: For AI Content Analysis Report (mock)
export interface AIContentAnalysisReportItem {
  section: string; // e.g., "Introduction", "Methodology"
  assessment: string; // e.g., "High probability of AI assistance", "Likely human-written"
  evidence?: string; // e.g., "Repetitive phrasing similar to common AI outputs."
}


export interface NotificationPreferences { 
  articleStatusChange: boolean; 
  newMessageFromEditor: boolean; // This might be removed if chat is gone
  submissionDeadlineReminder: boolean;
  articleSubmittedConfirmation?: boolean; 
  articleAssignedToEditor?: boolean; 
  peerReviewStarted?: boolean; 
  peerReviewCommentReceived?: boolean; 
  articleDecisionMade?: boolean; 
  articlePublishedConfirmation?: boolean; 
  doiAssignedToArticle?: boolean; 
}

export interface SystemHealth {
  databaseStatus: 'operational' | 'degraded' | 'down';
  apiServiceStatus: 'operational' | 'degraded' | 'down';
  storageUsagePercent: number;
  lastBackupDate?: string;
}

export interface ApiIntegrationStatus {
  serviceName: 'AI_Gemini' | 'PlagiarismChecker' | 'DOI_Provider';
  status: 'operational' | 'degraded' | 'unconfigured';
  apiKeySet: boolean;
  lastChecked: string;
}

export interface JournalTemplate {
  id: string;
  templateName: string;
  journalData: Partial<Omit<Journal, 'id' | 'name'>>; 
  createdAt: string;
}

export type NotificationEventType = 
  | 'user_registration' 
  | 'article_submitted' // This will be triggered after payment approval
  | 'article_assigned_to_editor' 
  | 'article_status_changed_to_reviewing' 
  | 'peer_review_started' 
  | 'peer_review_comment_received' 
  | 'article_status_changed_to_needs_revision' 
  | 'article_status_changed_to_accepted' 
  | 'article_status_changed_to_rejected' 
  | 'article_status_changed_to_published' 
  | 'doi_assigned_to_article' 
  | 'new_message_for_author' // Consider if this is still needed
  | 'new_message_for_editor' // Consider if this is still needed
  | 'password_reset_request'
  | 'issue_published'
  | 'plagiarism_check_completed'
  | 'article_submission_payment_approved'; // New notification for successful article submission payment


export interface SystemNotificationTemplate {
  event: NotificationEventType;
  subject_uz: string;
  body_uz: string; 
  subject_ru: string;
  body_ru: string;
  subject_en: string;
  body_en: string;
  isEnabled: boolean;
}

export enum AuditActionType {
  USER_LOGIN = 'USER_LOGIN',
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
  JOURNAL_CREATED = 'JOURNAL_CREATED',
  JOURNAL_UPDATED = 'JOURNAL_UPDATED',
  JOURNAL_DELETED = 'JOURNAL_DELETED',
  ARTICLE_SUBMISSION_PAYMENT_INITIATED = 'ARTICLE_SUBMISSION_PAYMENT_INITIATED', // New
  ARTICLE_SUBMISSION_RECEIPT_UPLOADED = 'ARTICLE_SUBMISSION_RECEIPT_UPLOADED', // New
  ARTICLE_SUBMITTED = 'ARTICLE_SUBMITTED', // This now happens after payment approval
  ARTICLE_STATUS_CHANGED = 'ARTICLE_STATUS_CHANGED',
  ARTICLE_EDITOR_ASSIGNED = 'ARTICLE_EDITOR_ASSIGNED',
  ARTICLE_DOI_ASSIGNED = 'ARTICLE_DOI_ASSIGNED', // Feature 1
  SETTINGS_UPDATED = 'SETTINGS_UPDATED',
  INTEGRATION_UPDATED = 'INTEGRATION_UPDATED',
  ISSUE_CREATED = 'ISSUE_CREATED', 
  ISSUE_UPDATED = 'ISSUE_UPDATED', 
  ISSUE_PUBLISHED = 'ISSUE_PUBLISHED', 
  ISSUE_PDF_GENERATED = 'ISSUE_PDF_GENERATED', // Feature 3
  ARTICLE_ASSIGNED_TO_ISSUE = 'ARTICLE_ASSIGNED_TO_ISSUE', 
  USER_BADGE_AWARDED = 'USER_BADGE_AWARDED', // Feature 6
  PLAGIARISM_PAYMENT_INITIATED = 'PLAGIARISM_PAYMENT_INITIATED',
  PLAGIARISM_CHECK_COMPLETED = 'PLAGIARISM_CHECK_COMPLETED',
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId?: string; 
  userEmail?: string;
  actionType: AuditActionType;
  targetEntityType?: 'User' | 'Journal' | 'Article' | 'System' | 'Issue' | 'PlagiarismCheck' | 'ArticleSubmissionPayment';
  targetEntityId?: string;
  details: string | Record<string, any>; 
}

export interface DoiProviderSettings { // Feature 1
  providerName?: 'CrossRef' | 'DataCite' | 'Other';
  apiKey?: string; 
  apiSecret?: string; 
  prefix?: string;
  isEnabled?: boolean;
}

export interface IntegrationSettings {
  serviceName: 'AI_Gemini' | 'PlagiarismChecker' | 'DOI_Provider';
  isEnabled: boolean;
  apiKey?: string; // Actual API Key (store securely, not in localStorage directly for prod)
  apiKeyMasked?: string; 
  monthlyLimit?: number;
  currentUsage?: number;
  serviceUrl?: string; // New for PlagiarismChecker and potentially others
  aiModules?: { 
    keywordSuggestion: boolean;
    abstractImprovement: boolean;
    journalSuggestion: boolean;
    referenceChecking: boolean;
    titleSuggestion?: boolean; 
    journalComplianceCheck?: boolean;
  };
  doiProviderSettings?: DoiProviderSettings; 
}

export interface AdminArticleSummary extends Article {
    authorName: string; 
    journalName: string; 
    assignedEditorName?: string; 
    daysInCurrentStatus?: number; 
}

export interface JournalManagerNavLink extends NavItem {
  journalId?: string; 
}

export interface NavItem {
  path: string;
  labelKey: string;
}

// Feature 8: Rankings
export interface UserRank {
  userId: string;
  userName: string;
  userSurname?: string;
  role: UserRole;
  score: number;
  rank: number;
  avatarUrl?: string; // URL to a mock avatar
  detail?: string; // e.g., "50 articles published" or "Avg. review time: 10 days"
}

export interface JournalRank {
  journalId: string;
  journalName: string;
  rank: number;
  score?: number; // e.g., impact factor or submission volume
  detail?: string; // e.g., "1200 submissions this year"
  coverImageUrl?: string;
}

// New types for Plagiarism Check Payment Flow and Notifications
export type PaymentStatus = 
  | 'payment_pending_user_action' // Initial state, user needs to start payment
  | 'payment_confirmation_pending' // User clicked run, confirm modal shown
  | 'payment_details_pending' // User agreed, details modal shown
  | 'payment_pending_admin_approval' // Receipt submitted, "admin" to approve
  | 'payment_approved_processing' // "Admin" approved, check is running
  | 'payment_failed' // If a real payment failed
  | 'results_ready'; // Check complete OR Submission complete

export interface CheckHistoryItem { // For Plagiarism Check
  id: string; // Unique ID for this check instance
  userId: string;
  fileName: string;
  initiatedDate: string; // When the check was first started by user
  paymentStatus: PaymentStatus;
  checkResult?: PlagiarismCheckResult; // Populated when results_ready
  certificateEligible?: boolean;
  receiptFileUrl?: string; // Mock URL for the uploaded receipt screenshot
  lastUpdated: string; // Timestamp of the last status update for this item
}

export interface NotificationItem {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error' | 'warning';
  timestamp: string;
  isRead: boolean;
  link?: string; // Optional link for the notification
}

// New Types for CalendarPage
export interface UserTask {
  id: string;
  userId: string;
  description: string;
  dueDate: string; // ISO date string (YYYY-MM-DD)
  isCompleted: boolean;
  createdAt: string; // ISO date string
  articleId?: string; // Optional: link to an article
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO date string (YYYY-MM-DD)
  type: 'deadline' | 'user_task' | 'meeting' | 'other';
  color: 'red' | 'amber' | 'emerald' | 'sky' | 'purple' | string;
}

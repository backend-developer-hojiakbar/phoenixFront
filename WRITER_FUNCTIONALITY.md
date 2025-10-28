# Writer Functionality Documentation

This document describes the writer-specific functionality added to the Phoenix Scientific Publication Center.

## Overview

Writers are a new user role in the system, distinct from authors (clients). Writers have a simplified interface focused on article creation and management.

## New User Role

- **Role Name**: `WRITER`
- **Role Value**: `writer`

## Writer Pages

All writer pages are located in the `/pages/writer/` directory:

1. **WriterDashboardPage.tsx** - Main dashboard with statistics and quick actions
2. **WriterSubmitArticlePage.tsx** - Page for submitting new articles
3. **WriterMyArticlesPage.tsx** - Page to view and manage submitted articles
4. **WriterArticleDetailPage.tsx** - Detailed view of a specific article
5. **WriterProfilePage.tsx** - User profile management
6. **WriterDraftsManagementPage.tsx** - Management of article drafts
7. **WriterTestPage.tsx** - Simple test page for verification

## Routes

The following routes have been added for writers:

- `/writer/dashboard` - Writer dashboard
- `/writer/submit-article` - Submit new article
- `/writer/my-articles` - View all articles
- `/writer/my-articles/:articleId` - View specific article
- `/writer/profile` - User profile
- `/writer/article-drafts` - Manage drafts
- `/writer/test` - Test page

## Navigation

Writers have their own navigation menu with the following items:

1. Dashboard
2. Submit Article
3. My Articles
4. Article Drafts
5. Profile

## Testing

### Default Writer User

For testing purposes, you can use the following credentials:

- **Phone**: `998900000000`
- **Password**: `writer123`
- **Role**: Writer

### Test Scripts

Two test scripts are included:

1. `add-default-writer.js` - Adds a default writer user to localStorage
2. `test-writer-login.js` - Provides functions to simulate writer login/logout

To use these scripts, you can either:
- Run them in the browser console, or
- Import them in your HTML file

## Implementation Notes

- All writer pages use mock data since there is no backend implementation yet
- When backend is ready, the API calls can be uncommented and implemented
- The UI follows the same design patterns as other roles in the application
- Responsive design is consistent with the rest of the application

## Future Backend Integration

When implementing the backend for writers:

1. Add writer-specific API endpoints
2. Uncomment the API calls in the writer pages
3. Update authentication to handle writer role properly
4. Implement proper data storage and retrieval for writer articles and drafts

## File Structure

```
/pages/writer/
  ├── WriterDashboardPage.tsx
  ├── WriterSubmitArticlePage.tsx
  ├── WriterMyArticlesPage.tsx
  ├── WriterArticleDetailPage.tsx
  ├── WriterProfilePage.tsx
  ├── WriterDraftsManagementPage.tsx
  └── WriterTestPage.tsx

/add-default-writer.js
/test-writer-login.js
/WRITER_FUNCTIONALITY.md
```
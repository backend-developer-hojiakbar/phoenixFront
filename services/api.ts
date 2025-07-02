// src/services/api.ts

import { User } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

interface AuthTokens {
  access: string;
  refresh: string;
}

const getAuthTokens = (): AuthTokens | null => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  if (accessToken && refreshToken) {
    return { access: accessToken, refresh: refreshToken };
  }
  return null;
};

const setAuthTokens = (tokens: AuthTokens) => {
  localStorage.setItem('accessToken', tokens.access);
  localStorage.setItem('refreshToken', tokens.refresh);
};

const removeAuthTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('anotUser');
};

const refreshToken = async (): Promise<string | null> => {
  const tokens = getAuthTokens();
  if (!tokens?.refresh) {
    return null;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: tokens.refresh }),
    });

    if (response.ok) {
      const newTokens = await response.json();
      setAuthTokens({ access: newTokens.access, refresh: tokens.refresh }); 
      return newTokens.access;
    } else {
      removeAuthTokens();
      window.location.href = '/login';
      return null;
    }
  } catch (error) {
    removeAuthTokens();
    window.location.href = '/login';
    return null;
  }
};

const apiRequest = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  data: any = null
): Promise<any> => {
  let tokens = getAuthTokens();
  const headers: HeadersInit = {};
  
  if (tokens) {
    headers['Authorization'] = `Bearer ${tokens.access}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (data) {
    if (data instanceof FormData) {
      config.body = data;
    } else {
      headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(data);
    }
  }

  let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.status === 401 && tokens) {
    const newAccessToken = await refreshToken();
    if (newAccessToken) {
      headers['Authorization'] = `Bearer ${newAccessToken}`;
      config.headers = headers;
      response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    } else {
      throw new Error('Session expired. Please log in again.');
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || 'An API error occurred');
  }

  if (response.status === 204) {
    return null; 
  }

  return response.json();
};

export const api = {
  get: (endpoint: string) => apiRequest(endpoint, 'GET'),
  post: (endpoint: string, data: any) => apiRequest(endpoint, 'POST', data),
  put: (endpoint: string, data: any) => apiRequest(endpoint, 'PUT', data),
  patch: (endpoint: string, data: any) => apiRequest(endpoint, 'PATCH', data),
  delete: (endpoint: string) => apiRequest(endpoint, 'DELETE'),
};

export const getUsers = () => api.get('/users/');
export const getEditors = () => api.get('/users/?role=journal_manager');
export const updateUser = (userId: string, userData: Partial<User>) => api.patch(`/users/${userId}/`, userData);
export const createUser = (userData: Partial<User>) => api.post('/users/', userData);
export const deleteUser = (userId: string) => api.delete(`/users/${userId}/`);

export const getJournals = () => api.get('/journals/');
export const getManagedJournals = () => api.get('/journals/'); 
export const getJournalById = (journalId: string) => api.get(`/journals/${journalId}/`);
export const updateJournal = (journalId: string, journalData: FormData) => api.patch(`/journals/${journalId}/`, journalData);
export const createJournal = (journalData: FormData) => api.post('/journals/', journalData);
export const deleteJournal = (journalId: string) => api.delete(`/journals/${journalId}/`);

export const getArticlesForUser = () => api.get('/articles/');
export const getArticleById = (articleId: string) => api.get(`/articles/${articleId}/`);
export const getAssignedArticles = () => api.get('/articles/'); 
export const submitArticle = (articleData: FormData) => api.post('/articles/', articleData);
export const updateArticleStatus = (articleId: string, data: { status: string; comment?: string }) => api.patch(`/articles/${articleId}/`, data);
export const assignDoiToArticle = (articleId: string, doi: string) => api.patch(`/articles/${articleId}/`, { doi });
export const getArticleTitlesForUser = () => api.get('/articles/?fields=id,title');

export const getDashboardData = () => api.get('/dashboard-summary/');
export const searchPublicArticles = (searchTerm: string) => api.get(`/articles/search/?q=${searchTerm}`);
export const getRankings = () => api.get('/rankings/');
export const getAdminArticles = () => api.get('/admin/articles/');
export const reassignEditor = (articleId: string, newEditorId: string) => api.post(`/admin/articles/${articleId}/reassign/`, { editor_id: newEditorId });
export const getAuditLogs = () => api.get('/audit-logs/');

export const getIssuesForJournal = (journalId: string) => api.get(`/journals/${journalId}/issues/`);
export const createIssue = (journalId: string, issueData: any) => api.post(`/journals/${journalId}/issues/`, issueData);
export const updateIssue = (issueId: string, issueData: any) => api.patch(`/issues/${issueId}/`, issueData);
export const deleteIssue = (issueId: string) => api.delete(`/issues/${issueId}/`);
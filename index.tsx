import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { LanguageProvider } from './contexts/LanguageContext.tsx';
import { ServicesProvider } from './contexts/ServicesContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <ServicesProvider>
          <App />
        </ServicesProvider>
      </AuthProvider>
    </LanguageProvider>
  </React.StrictMode>,
);
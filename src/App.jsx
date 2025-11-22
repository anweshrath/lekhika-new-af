import React, { useState } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { UserAuthProvider } from './contexts/UserAuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { GamificationProvider } from './contexts/GamificationContext'
import { SuperAdminProvider } from './contexts/SuperAdminContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import ContentStudio from './components/ContentStudio'
import UserAuth from './pages/UserAuth'
import Books from './pages/Books'
import BookReader from './components/BookReader'
import CopyAITools from './pages/CopyAITools'
import Settings from './pages/Settings'
import TokenUsageDashboard from './components/TokenUsageDashboard'
import Sales from './pages/Sales'
import Live from './pages/Live'
import SuperAdminLogin from './pages/SuperAdmin/SuperAdminLogin'
import SuperAdminDashboard from './pages/SuperAdmin/SuperAdminDashboard'
import Levels from './pages/SuperAdmin/Levels'
import InternalAITest from './pages/InternalAITest'
import Profile from './pages/Profile'
import Analytics from './pages/Analytics'
import Billing from './pages/Billing'
import CreateBook from './pages/CreateBook'
import './App.css'
import './styles/professionalDesignSystem.css'
import './styles/themes.css'
import './styles/accessibility.css'
import PoweredByFooter from './components/PoweredByFooter'
import { UserPreferencesProvider } from './contexts/UserPreferencesContext'
import PremiumSidebar from './components/PremiumSidebar'

// SURGICAL STRIKE: The garbage duplicate code is being annihilated from this file.
// It now lives correctly in its own file, BookReaderLayout.jsx.

function App() {
  return (
    <UserPreferencesProvider>
      <ThemeProvider>
        <UserAuthProvider>
          <GamificationProvider>
            <SuperAdminProvider>
              <div className="App">
            {/* Skip to main content link for accessibility */}
            <a 
              href="#main-content" 
              className="skip-link"
              style={{
                position: 'absolute',
                top: '-40px',
                left: '6px',
                background: 'var(--color-primary)',
                color: 'white',
                padding: '8px',
                textDecoration: 'none',
                borderRadius: '4px',
                zIndex: 1000
              }}
              onFocus={(e) => e.target.style.top = '6px'}
              onBlur={(e) => e.target.style.top = '-40px'}
            >
              Skip to main content
            </a>
            
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-lg)'
                },
                success: {
                  style: {
                    background: 'var(--color-success-light)',
                    color: 'var(--color-success)',
                    border: '1px solid var(--color-success)'
                  }
                },
                error: {
                  style: {
                    background: 'var(--color-error-light)',
                    color: 'var(--color-error)',
                    border: '1px solid var(--color-error)'
                  }
                }
              }}
            />
            
            <main id="main-content">
              <Routes>
                {/* SuperAdmin Routes */}
                <Route path="/superadmin" element={<SuperAdminLogin />} />
                <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
                <Route path="/superadmin/levels" element={<Levels />} />
                
                {/* Internal Testing Route */}
                <Route path="/internal/ai-test" element={<InternalAITest />} />
                
                
                {/* Sales Page Route */}
                <Route path="/sales" element={<Sales />} />
        <Route path="/live" element={<Live />} />
                
                {/* User Auth Routes */}
                <Route path="/login" element={<UserAuth />} />
                <Route path="/auth" element={<UserAuth />} />
                
                {/* Main App Routes */}
                <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
                
                <Route path="/app" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="studio" element={<ContentStudio />} />
                  <Route path="books" element={<Books />} />
                  {/* SURGICAL REVERT: The book reader route is restored to its original, simple location. */}
                  <Route path="books/:id" element={<BookReader />} />
                  <Route path="copyai" element={<CopyAITools />} />
                  <Route path="tokens" element={<TokenUsageDashboard />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="billing" element={<Billing />} />
                  <Route path="create" element={<CreateBook />} />
                </Route>
              </Routes>
            </main>
            
            <PoweredByFooter />
          </div>
          </SuperAdminProvider>
        </GamificationProvider>
      </UserAuthProvider>
    </ThemeProvider>
    </UserPreferencesProvider>
  )
}

export default App

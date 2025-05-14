import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { getTheme } from './themes'
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:3000'
import './index.css';

// Context
import { AuthProvider } from './components/AuthContext';

// Routes
import LoginRegisterPage from './pages/LoginRegisterPage'
import MainPage from './pages/MainPage'

// Route protection (vs unauthenticated access)
import ProtectedRoute from './components/ProtectedRoute';

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const theme = getTheme(prefersDark ? 'dark' : 'light')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate replace to="/login" />} />
            <Route path="/login" element={<LoginRegisterPage />} />
            <Route
                path="/main"
                element={
                    <ProtectedRoute>
                        <MainPage />
                    </ProtectedRoute>
                }
            />       
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
)
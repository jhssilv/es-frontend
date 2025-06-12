// app.tsx

import React, { useContext, useMemo } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { getTheme } from './themes'
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:3000'

// Context
import { AuthProvider } from './components/AuthContext';
import { ConfigProvider, ConfigContext, type Config } from './components/ConfigContext' // Import ConfigContext and Config type

// Routes
import LoginRegisterPage from './pages/LoginRegisterPage'
import MainPage from './pages/MainPage'

// Route protection
import ProtectedRoute from './components/ProtectedRoute';

// 1. Create a new App component that will consume the context
function App() {
  // Use the context to get the current theme mode ('light' or 'dark')
  const { theme: themeMode } = useContext(ConfigContext) as Config;

  // Create the MUI theme object. useMemo ensures it's only recalculated when the themeMode changes.
  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
    </ThemeProvider>
  );
}

// 2. Render your app, wrapping the new App component with the providers
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ConfigProvider>
        <App />
      </ConfigProvider>
    </AuthProvider>
  </React.StrictMode>
)
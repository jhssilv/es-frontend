import React from 'react'
import ReactDOM from 'react-dom/client'
import LoginRegisterPAge from './pages/LoginRegisterPage'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { getTheme } from './themes'

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const theme = getTheme(prefersDark ? 'dark' : 'light')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LoginRegisterPAge />
    </ThemeProvider>
  </React.StrictMode>
)

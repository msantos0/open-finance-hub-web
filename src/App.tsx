import { BrowserRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { AppRoutes } from './routes/AppRoutes'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#176b5b', light: '#e4f3ef', dark: '#0f4f43' },
    secondary: { main: '#e4a11b' },
    background: { default: '#f7f8f6', paper: '#ffffff' },
    text: { primary: '#1f2b2a', secondary: '#71807c' },
  },
  typography: {
    fontFamily: '"DM Sans", "Segoe UI", sans-serif',
    h4: { fontSize: 'clamp(1.75rem, 3vw, 2.35rem)' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: { styleOverrides: { root: { border: '1px solid #e6ebe8', boxShadow: '0 8px 24px rgba(27, 58, 49, 0.04)' } } },
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App

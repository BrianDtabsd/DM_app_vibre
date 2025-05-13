import React from 'react'
import ReactDOM from 'react-dom/client'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import App from './App'
import './index.css'

// Define gradient colors as CSS variables for use in component styles
const purpleToSilverGradient = 'linear-gradient(135deg, #8A2BE2 0%, #A7A7A7 100%)';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#8A2BE2', // Purple base color
      light: '#9D4EFF',
      dark: '#6A1B9A',
    },
    text: {
      primary: '#424242', // Dark grey
      secondary: '#616161', // Medium dark grey
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: 'inherit',
          '&.MuiButton-contained': {
            background: purpleToSilverGradient,
            color: 'white',
            '&:hover': {
              backgroundPosition: 'right center',
              transition: 'all 0.5s ease',
              filter: 'brightness(1.1)',
            },
          },
          '&.MuiButton-outlined': {
            borderColor: '#8A2BE2',
            color: '#8A2BE2',
            background: 'transparent',
            '&:hover': {
              borderColor: '#6A1B9A',
              color: '#6A1B9A',
              background: 'rgba(138, 43, 226, 0.08)',
            },
          },
        },
      },
      defaultProps: {
        variant: 'outlined', // Make outlined the default variant
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#8A2BE2',
          '&:hover': {
            color: '#6A1B9A',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: 'rgba(138, 43, 226, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(138, 43, 226, 0.20)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(138, 43, 226, 0.08)',
          },
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
) 
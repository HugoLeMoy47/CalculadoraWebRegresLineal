import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
      light: '#8899ff',
      dark: '#5568d3',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#764ba2',
      light: '#9967c9',
      dark: '#5a3681',
      contrastText: '#ffffff',
    },
    success: {
      main: '#4caf50',
      light: '#66bb6a',
      dark: '#388e3c',
    },
    error: {
      main: '#f44336',
      light: '#ef5350',
      dark: '#d32f2f',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#666666',
      disabled: '#999999',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#ffffff',
            '& fieldset': {
              borderColor: '#e0e0e0',
            },
            '&:hover fieldset': {
              borderColor: '#667eea',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#667eea',
              borderWidth: 2,
            },
            '& input': {
              color: '#212121',
              fontSize: '1rem',
              '&::placeholder': {
                color: '#999999',
                opacity: 1,
              },
            },
          },
          '& .MuiInputLabel-root': {
            color: '#333333',
            '&.Mui-focused': {
              color: '#667eea',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 600,
          padding: '10px 24px',
          transition: 'all 0.3s ease',
        },
        contained: {
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)',
          '&:hover': {
            boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: '2px solid #e0e0e0',
        },
        indicator: {
          backgroundColor: '#667eea',
          height: 3,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 500,
          color: '#666666',
          '&.Mui-selected': {
            color: '#667eea',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          fontSize: '0.95rem',
          borderRadius: 8,
          padding: '12px 16px',
        },
        standardError: {
          backgroundColor: '#ffebee',
          color: '#c62828',
          '& .MuiAlert-icon': {
            color: '#f44336',
          },
        },
        standardWarning: {
          backgroundColor: '#fff3e0',
          color: '#e65100',
          '& .MuiAlert-icon': {
            color: '#ff9800',
          },
        },
        standardInfo: {
          backgroundColor: '#e3f2fd',
          color: '#01579b',
          '& .MuiAlert-icon': {
            color: '#2196f3',
          },
        },
        standardSuccess: {
          backgroundColor: '#e8f5e9',
          color: '#1b5e20',
          '& .MuiAlert-icon': {
            color: '#4caf50',
          },
        },
      },
    },
  },
})

export default theme

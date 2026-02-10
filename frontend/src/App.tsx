import React, { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import theme from './theme'
import DataUpload from './components/DataUpload'
import ModelFit from './components/ModelFit'
import RegressionResults from './components/RegressionResults'
import ScenarioSimulator from './components/ScenarioSimulator'

interface RegressionData {
  coefficients: Record<string, number>
  p_values: Record<string, number>
  r_squared: number
  adjusted_r_squared: number
  vif_values: Record<string, number> | null
  observations: number
  fitted_values: number[]
  residuals: number[]
  aic: number
  bic: number
  f_statistic: number
  f_pvalue: number
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  )
}

function App() {
  const [dataLoaded, setDataLoaded] = useState(false)
  const [regressionResults, setRegressionResults] = useState<RegressionData | null>(null)
  const [activeTab, setActiveTab] = useState(0)
  const muiTheme = useTheme()
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'))

  const handleDataUpload = () => {
    setDataLoaded(true)
    setActiveTab(1)
  }

  const handleModelFit = (results: RegressionData) => {
    setRegressionResults(results)
    setActiveTab(2)
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="top-right" />

      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          py: 4,
        }}
      >
        <Container maxWidth="xl">
          {/* Header */}
          <Box
            sx={{
              textAlign: 'center',
              mb: 4,
              animation: 'fadeIn 0.5s ease-in',
              '@keyframes fadeIn': {
                '0%': { opacity: 0, transform: 'translateY(-20px)' },
                '100%': { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <AnalyticsIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />
            </Box>
            <Typography
              variant="h1"
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                mb: 1,
              }}
            >
              Calculadora de Atribución Marketing
            </Typography>
            <Typography variant="h5" color="textSecondary" sx={{ opacity: 0.9 }}>
              Análisis de Regresión Lineal Múltiple
            </Typography>
          </Box>

          {/* Tabs Navigation */}
          <Paper
            elevation={2}
            sx={{
              mb: 3,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant={isMobile ? 'scrollable' : 'fullWidth'}
              scrollButtons={isMobile ? 'auto' : false}
              sx={{
                '& .MuiTab-root': {
                  py: 2,
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                },
              }}
            >
              <Tab label="1. Cargar Datos" id="tab-0" aria-controls="tabpanel-0" />
              <Tab
                label="2. Ajustar Modelo"
                id="tab-1"
                aria-controls="tabpanel-1"
                disabled={!dataLoaded}
              />
              <Tab
                label="3. Resultados"
                id="tab-2"
                aria-controls="tabpanel-2"
                disabled={!regressionResults}
              />
              <Tab
                label="4. Simulación"
                id="tab-3"
                aria-controls="tabpanel-3"
                disabled={!regressionResults}
              />
            </Tabs>
          </Paper>

          {/* Content */}
          <Paper
            elevation={3}
            sx={{
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              p: { xs: 2, sm: 3, md: 4 },
              mb: 3,
              minHeight: '500px',
            }}
          >
            <TabPanel value={activeTab} index={0}>
              <DataUpload onSuccess={handleDataUpload} />
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
              {dataLoaded && <ModelFit onSuccess={handleModelFit} />}
            </TabPanel>
            <TabPanel value={activeTab} index={2}>
              {regressionResults && <RegressionResults data={regressionResults} />}
            </TabPanel>
            <TabPanel value={activeTab} index={3}>
              {regressionResults && (
                <ScenarioSimulator features={Object.keys(regressionResults.coefficients)} />
              )}
            </TabPanel>
          </Paper>

          {/* Footer */}
          <Box
            sx={{
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.8)',
              py: 2,
              fontSize: '0.9rem',
            }}
          >
            <Divider sx={{ mb: 2, opacity: 0.3 }} />
            <Typography variant="caption">
              © 2024 Marketing Attribution Calculator. Powered by Linear Regression Analysis
            </Typography>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default App


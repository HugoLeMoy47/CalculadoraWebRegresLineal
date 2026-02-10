import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
  Grid,
  Card,
  CardContent,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  AlertTitle,
  CircularProgress,
} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import { simulateScenario } from '../api/client'
import { showErrorWithTips } from '../utils/errorHandler'

interface ScenarioSimulatorProps {
  features: string[]
}

interface SimulationResult {
  baseline_prediction: number
  scenario_prediction: number
  delta: number
  delta_percentage: number
  changes_applied: Record<string, number>
}

export default function ScenarioSimulator({ features }: ScenarioSimulatorProps) {
  const featureFiltered = features.filter((f) => f !== 'const')

  const [changes, setChanges] = useState<Record<string, number>>({})
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChangeInput = (feature: string, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value)
    setChanges({
      ...changes,
      [feature]: numValue,
    })
  }

  const handleReset = () => {
    setChanges({})
    setResult(null)
  }

  const handleSimulate = async () => {
    const activeChanges = Object.fromEntries(
      Object.entries(changes).filter(([, v]) => v !== 0)
    )

    if (Object.keys(activeChanges).length === 0) {
      showErrorWithTips({
        response: {
          data: { detail: 'Por favor especifica al menos un cambio' },
        },
      })
      return
    }

    setLoading(true)

    try {
      const response = await simulateScenario(activeChanges)
      setResult(response.data)
      toast.success('✓ Simulación completada', { duration: 4000 })
    } catch (error: any) {
      showErrorWithTips(error)
    } finally {
      setLoading(false)
    }
  }

  const hasActiveChanges = Object.values(changes).some((v) => v !== 0)

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <PlayArrowIcon sx={{ mr: 1, color: 'primary.main', fontSize: 32 }} />
        <Typography variant="h2" sx={{ fontWeight: 700 }}>
          Simulador de Escenarios
        </Typography>
      </Box>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Modifica los gastos por canal y visualiza el impacto predicho en tu objetivo
      </Typography>

      <Grid container spacing={3}>
        {/* Panel de entrada */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h3" sx={{ fontWeight: 600, mb: 3 }}>
              Cambios Porcentuales por Canal
            </Typography>

            <Stack spacing={3}>
              {featureFiltered.map((feature) => (
                <Box key={feature}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {feature}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        color: changes[feature] > 0 ? 'success.main' : 'error.main',
                      }}
                    >
                      {changes[feature] >= 0 ? '+' : ''}
                      {(changes[feature] || 0).toFixed(1)}%
                    </Typography>
                  </Box>

                  <TextField
                    type="number"
                    placeholder="0"
                    value={changes[feature] || ''}
                    onChange={(e) => handleChangeInput(feature, e.target.value)}
                    fullWidth
                    size="small"
                    variant="outlined"
                    inputProps={{ step: '5', min: '-100', max: '100' }}
                    sx={{ mb: 1 }}
                  />

                  <Slider
                    value={changes[feature] || 0}
                    onChange={(_e, newValue) =>
                      handleChangeInput(feature, newValue.toString())
                    }
                    min={-100}
                    max={100}
                    step={5}
                    marks={[
                      { value: -100, label: '-100%' },
                      { value: 0, label: '0%' },
                      { value: 100, label: '+100%' },
                    ]}
                  />
                </Box>
              ))}
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSimulate}
                disabled={loading || !hasActiveChanges}
                fullWidth
                startIcon={loading ? <CircularProgress size={20} /> : <PlayArrowIcon />}
              >
                {loading ? 'Simulando...' : 'Simular Escenario'}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={handleReset}
                fullWidth
                startIcon={<RestartAltIcon />}
              >
                Restablecer
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* Panel de resultados */}
        {result && (
          <Grid item xs={12} md={7}>
            <Stack spacing={3}>
              {/* Result Cards */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                        Predicción Base
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 700, color: 'info.main', mb: 1 }}
                      >
                        {result.baseline_prediction.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Escenario actual
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                        Predicción Escenario
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}
                      >
                        {result.scenario_prediction.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Con cambios aplicados
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card
                    variant="outlined"
                    sx={{
                      backgroundColor: result.delta >= 0 ? '#e8f5e9' : '#ffebee',
                      borderColor: result.delta >= 0 ? '#4caf50' : '#f44336',
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                        {result.delta >= 0 ? (
                          <TrendingUpIcon sx={{ color: 'success.main', fontSize: 32 }} />
                        ) : (
                          <TrendingDownIcon sx={{ color: 'error.main', fontSize: 32 }} />
                        )}
                      </Box>
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                        Delta Absoluto
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          color: result.delta >= 0 ? 'success.main' : 'error.main',
                          mb: 1,
                        }}
                      >
                        {result.delta >= 0 ? '+' : ''}
                        {result.delta.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Diferencia en unidades
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card
                    variant="outlined"
                    sx={{
                      backgroundColor: result.delta_percentage >= 0 ? '#e8f5e9' : '#ffebee',
                      borderColor: result.delta_percentage >= 0 ? '#4caf50' : '#f44336',
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                        {result.delta_percentage >= 0 ? (
                          <TrendingUpIcon sx={{ color: 'success.main', fontSize: 32 }} />
                        ) : (
                          <TrendingDownIcon sx={{ color: 'error.main', fontSize: 32 }} />
                        )}
                      </Box>
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                        Cambio Porcentual
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          color: result.delta_percentage >= 0 ? 'success.main' : 'error.main',
                          mb: 1,
                        }}
                      >
                        {result.delta_percentage >= 0 ? '+' : ''}
                        {result.delta_percentage.toFixed(2)}%
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Variación relativa
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Tabla de cambios aplicados */}
              <Paper>
                <Box sx={{ p: 2, backgroundColor: '#f5f7fa', borderBottom: '1px solid #e0e0e0' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Cambios Aplicados
                  </Typography>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: '#fafbfc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Variable</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          Cambio (%)
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(result.changes_applied).map(([var_name, change]) => (
                        <TableRow key={var_name}>
                          <TableCell sx={{ fontWeight: 500 }}>{var_name}</TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontWeight: 600,
                              color: change >= 0 ? 'success.main' : 'error.main',
                            }}
                          >
                            {change >= 0 ? '+' : ''}
                            {change.toFixed(2)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              {/* Insights */}
              <Alert severity="info" icon={<LightbulbIcon />}>
                <AlertTitle>💡 Insights de Impacto</AlertTitle>
                <Stack spacing={1} sx={{ fontSize: '0.9rem' }}>
                  <Box>
                    {result.delta >= 0
                      ? `✓ El escenario predicho generaría una mejora de ${Math.abs(result.delta).toFixed(2)} unidades (+${result.delta_percentage.toFixed(2)}%)`
                      : `⚠ El escenario predicho resultaría en una reducción de ${Math.abs(result.delta).toFixed(2)} unidades (${result.delta_percentage.toFixed(2)}%)`}
                  </Box>
                  <Box>
                    📊 Predicción base (sin cambios): <strong>{result.baseline_prediction.toFixed(2)}</strong>
                  </Box>
                  <Box>
                    🎯 Nueva predicción (con cambios): <strong>{result.scenario_prediction.toFixed(2)}</strong>
                  </Box>
                </Stack>
              </Alert>
            </Stack>
          </Grid>
        )}

        {/* Empty state */}
        {!result && hasActiveChanges && (
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: '#f9f9f9' }}>
              <Typography variant="body1" color="textSecondary">
                Haz clic en "Simular Escenario" para ver los resultados
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

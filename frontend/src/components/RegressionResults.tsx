import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Card,
  CardContent,
  Alert,
  AlertTitle,
  Chip,
} from '@mui/material'
import AssessmentIcon from '@mui/icons-material/Assessment'
import WarningIcon from '@mui/icons-material/Warning'

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

interface RegressionResultsProps {
  data: RegressionData
}

export default function RegressionResults({ data }: RegressionResultsProps) {
  // Preparar datos para gráfico de residuos
  const residualData = data.residuals.map((r, i) => ({
    index: i,
    residual: r,
    fitted: data.fitted_values[i],
  }))

  // Preparar datos para gráfico de coeficientes (excluyendo 'const')
  const coefficientData = Object.entries(data.coefficients)
    .filter(([key]) => key !== 'const')
    .map(([name, value]) => ({
      name,
      coeficiente: parseFloat(value.toFixed(4)),
      pvalue: parseFloat((data.p_values[name] || 0).toFixed(4)),
    }))

  // Preparar datos para gráfico de VIF
  const vifData = data.vif_values
    ? Object.entries(data.vif_values).map(([name, value]) => ({
        name,
        vif: parseFloat(value.toFixed(2)),
      }))
    : []

  const significantVif = vifData.filter((v) => v.vif > 10)
  const residualMean = data.residuals.reduce((a, b) => a + b, 0) / data.residuals.length
  const residualStd = Math.sqrt(
    data.residuals.reduce((a, b) => a + b ** 2, 0) / data.residuals.length
  )

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AssessmentIcon sx={{ mr: 1, color: 'primary.main', fontSize: 32 }} />
        <Typography variant="h2" sx={{ fontWeight: 700 }}>
          Resultados de la Regresión
        </Typography>
      </Box>

      {/* Métricas principales */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 600, mb: 2 }}>
          Métricas Clave del Modelo
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {data.r_squared.toFixed(4)}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1 }}>
                  R² (Ajuste)
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Proporción de varianza explicada
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                  {data.adjusted_r_squared.toFixed(4)}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1 }}>
                  R² Ajustado
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Ajustado por número de variables
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {data.f_statistic.toFixed(2)}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1 }}>
                  F-estadístico
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  p-value: {data.f_pvalue.toFixed(6)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                  {data.observations}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1 }}>
                  Observaciones
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Número de datos usados
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.main' }}>
                  {data.aic.toFixed(2)}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1 }}>
                  AIC
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Criterio de información
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.main' }}>
                  {data.bic.toFixed(2)}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1 }}>
                  BIC
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Criterio bayesiano
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Coeficientes */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 600, mb: 2 }}>
          Coeficientes de Regresión
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#e8eef7' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Variable</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Coeficiente
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  P-value
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  Significancia
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(data.coefficients).map(([name, coef]) => {
                const pval = data.p_values[name] || 1
                const isSignificant = pval < 0.05
                return (
                  <TableRow
                    key={name}
                    sx={{
                      backgroundColor: name === 'const' ? '#f9f9f9' : 'inherit',
                      fontWeight: name === 'const' ? 600 : 400,
                    }}
                  >
                    <TableCell sx={{ fontWeight: name === 'const' ? 700 : 600 }}>
                      {name}
                    </TableCell>
                    <TableCell align="right">{parseFloat(coef.toFixed(6))}</TableCell>
                    <TableCell align="right">{pval.toFixed(6)}</TableCell>
                    <TableCell align="center">
                      {isSignificant ? (
                        <Chip label="***" color="success" variant="outlined" size="small" />
                      ) : (
                        <Chip label="ns" variant="outlined" size="small" />
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
          *** p &lt; 0.05 (significante estadísticamente) | ns = no significante
        </Typography>
      </Box>

      {/* Gráfico de coeficientes */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 600, mb: 2 }}>
          Magnitud de Coeficientes
        </Typography>
        <Paper sx={{ p: 2 }}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={coefficientData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip cursor={{ fill: 'rgba(102, 126, 234, 0.1)' }} />
              <Bar dataKey="coeficiente" fill="#667eea" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* VIF - Multicolinealidad */}
      {vifData.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 600, mb: 2 }}>
            VIF (Variance Inflation Factor) - Multicolinealidad
          </Typography>
          {significantVif.length > 0 && (
            <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
              <AlertTitle>⚠️ Multicolinealidad Detectada</AlertTitle>
              Se detectó multicolinealidad en: <strong>{significantVif.map((v) => v.name).join(', ')}</strong>
              <br />
              Considera usar Ridge Regression o eliminar variables altamente correlacionadas.
            </Alert>
          )}
          <Paper sx={{ p: 2 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vifData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip cursor={{ fill: 'rgba(255, 107, 107, 0.1)' }} />
                <Bar dataKey="vif" fill="#ff6b6b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            🔍 VIF &gt; 10 indica multicolinealidad potencial | VIF &lt; 5 es generalmente seguro
          </Typography>
        </Box>
      )}

      {/* Residuos */}
      <Box>
        <Typography variant="h3" sx={{ fontWeight: 600, mb: 2 }}>
          Análisis de Residuos
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {residualMean.toFixed(6)}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1 }}>
                  Media de Residuos
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  ✓ Idealmente debe ser ≈ 0
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                  {residualStd.toFixed(6)}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1 }}>
                  Desv. Est. de Residuos
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Variabilidad no explicada
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ p: 2 }}>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="fitted" name="Valores Ajustados" />
              <YAxis dataKey="residual" name="Residuos" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Residuos" data={residualData} fill="#82ca9d" />
            </ScatterChart>
          </ResponsiveContainer>
        </Paper>
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
          📊 Un buen modelo tiene residuos aleatoriamente distribuidos sin patrones visibles
        </Typography>
      </Box>
    </Box>
  )
}

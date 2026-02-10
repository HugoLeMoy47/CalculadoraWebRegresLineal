import React, { useState } from 'react'
import toast from 'react-hot-toast'
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
  FormControlLabel,
  RadioGroup,
  Radio,
  Slider,
  CircularProgress,
  Alert,
  AlertTitle,
  Card,
  CardContent,
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import InfoIcon from '@mui/icons-material/Info'
import { fitModel } from '../api/client'
import { showErrorWithTips } from '../utils/errorHandler'

interface ModelFitProps {
  onSuccess: (results: any) => void
}

export default function ModelFit({ onSuccess }: ModelFitProps) {
  const [regularization, setRegularization] = useState<string>('none')
  const [alpha, setAlpha] = useState(1.0)
  const [bootstrapSamples, setBootstrapSamples] = useState(1000)
  const [loading, setLoading] = useState(false)
  const MAX_BOOTSTRAP = 5000

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (bootstrapSamples > MAX_BOOTSTRAP) {
      showErrorWithTips({
        response: {
          data: {
            detail: `El número máximo de muestras bootstrap es ${MAX_BOOTSTRAP}`,
          },
        },
      })
      setLoading(false)
      return
    }

    try {
      const response = await fitModel(
        regularization === 'none' ? undefined : regularization,
        alpha,
        bootstrapSamples
      )

      onSuccess(response.data)
      toast.success('✓ Modelo ajustado exitosamente', { duration: 4000 })
    } catch (error: any) {
      showErrorWithTips(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <SettingsIcon sx={{ mr: 1, color: 'primary.main', fontSize: 32 }} />
        <Typography variant="h2" sx={{ fontWeight: 700 }}>
          Ajuste de Modelo
        </Typography>
      </Box>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Configura los parámetros del modelo de regresión lineal
      </Typography>

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Regularization Selection */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Tipo de Regularización
              </Typography>
              <RadioGroup
                value={regularization}
                onChange={(e) => setRegularization(e.target.value)}
              >
                <FormControlLabel
                  value="none"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        Sin Regularización (OLS)
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Mínimos Cuadrados Ordinarios - Recomendado para la mayoría de casos
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="ridge"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        Ridge Regression (L2)
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Añade penalización para manejar multicolinealidad
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Alpha Parameter */}
          <Box
            sx={{
              opacity: regularization === 'none' ? 0.5 : 1,
              pointerEvents: regularization === 'none' ? 'none' : 'auto',
              transition: 'opacity 0.3s',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Parámetro de Regularización (Alpha)
            </Typography>
            <TextField
              type="number"
              value={alpha}
              onChange={(e) => setAlpha(parseFloat(e.target.value))}
              disabled={regularization === 'none'}
              fullWidth
              variant="outlined"
              inputProps={{ step: '0.1', min: '0.01', max: '10' }}
              helperText="Valores típicos: 0.1 - 10. Mayor valor = mayor penalización"
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="textSecondary">
                Visualización: {alpha.toFixed(2)}
              </Typography>
              <Slider
                value={alpha}
                onChange={(_e, newValue) => setAlpha(newValue as number)}
                min={0.01}
                max={10}
                step={0.1}
                marks={[
                  { value: 0.1, label: '0.1' },
                  { value: 5, label: '5' },
                  { value: 10, label: '10' },
                ]}
                disabled={regularization === 'none'}
                sx={{ mt: 1 }}
              />
            </Box>
          </Box>

          {/* Bootstrap Samples */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Muestras Bootstrap para Intervalos de Confianza
            </Typography>
            <TextField
              type="number"
              value={bootstrapSamples}
              onChange={(e) => setBootstrapSamples(parseInt(e.target.value))}
              fullWidth
              variant="outlined"
              inputProps={{ step: '100', min: '100', max: MAX_BOOTSTRAP.toString() }}
              helperText={`Rango: 100 - ${MAX_BOOTSTRAP}. Valores típicos: 1000-2000`}
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="textSecondary">
                {bootstrapSamples} muestras
              </Typography>
              <Slider
                value={bootstrapSamples}
                onChange={(_e, newValue) => setBootstrapSamples(newValue as number)}
                min={100}
                max={MAX_BOOTSTRAP}
                step={100}
                marks={[
                  { value: 100, label: '100' },
                  { value: 2500, label: '2500' },
                  { value: 5000, label: '5000' },
                ]}
                sx={{ mt: 1 }}
              />
            </Box>
          </Box>

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : undefined}
          >
            {loading ? 'Ajustando modelo...' : 'Ajustar Modelo'}
          </Button>
        </Stack>
      </form>

      {/* Info Section */}
      <Paper sx={{ mt: 4, p: 3, backgroundColor: '#f5f7fa', borderLeft: '4px solid #667eea' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <InfoIcon sx={{ mr: 1, color: 'info.main' }} />
          <Typography variant="h3" sx={{ fontSize: '1.2rem', fontWeight: 600 }}>
            ℹ️ Información sobre Parámetros
          </Typography>
        </Box>

        <Stack spacing={2}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                OLS (Ordinary Least Squares)
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Método estándar que minimiza la suma de cuadrados de residuos sin penalización.
                Ideal cuando tu dataset es grande y los datos son limpios. Recomendado para comenzar.
              </Typography>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'secondary.main' }}>
                Ridge Regression (L2)
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Añade una penalización proporcional al cuadrado de los coeficientes. Útil para
                manejar multicolinealidad cuando tus variables independientes están correlacionadas.
                Mayor alpha = mayor penalización.
              </Typography>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'success.main' }}>
                Bootstrap
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Técnica de remuestreo que calcula intervalos de confianza al 95% para los
                coeficientes. Más muestras = más precisión pero más tiempo. 1000-2000 es un buen balance.
              </Typography>
            </CardContent>
          </Card>
        </Stack>

        <Alert severity="info" sx={{ mt: 2 }} icon={<InfoIcon />}>
          <AlertTitle>💡 Consejo</AlertTitle>
          Comienza con OLS y 1000 muestras bootstrap. Si notas problemas de multicolinealidad,
          prueba con Ridge.
        </Alert>
      </Paper>
    </Box>
  )
}

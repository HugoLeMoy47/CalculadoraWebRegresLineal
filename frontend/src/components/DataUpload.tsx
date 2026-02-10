import React, { useState } from 'react'
import toast from 'react-hot-toast'
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  AlertTitle,
  CircularProgress,
  Stack,
  Chip,
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import InfoIcon from '@mui/icons-material/Info'
import { uploadData } from '../api/client'
import { showErrorWithTips } from '../utils/errorHandler'

interface DataUploadProps {
  onSuccess: () => void
}

export default function DataUpload({ onSuccess }: DataUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [dateColumn, setDateColumn] = useState('')
  const [targetColumn, setTargetColumn] = useState('')
  const [featureColumns, setFeatureColumns] = useState('')
  const [controlColumns, setControlColumns] = useState('')
  const [loading, setLoading] = useState(false)
  const MAX_UPLOAD_BYTES = 5_000_000

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const f = e.target.files[0]

      if (f && f.size > MAX_UPLOAD_BYTES) {
        showErrorWithTips({
          response: { data: { detail: 'Archivo demasiado grande. Tamaño máximo: 5 MB' } },
        })
        e.currentTarget.value = ''
        setFile(null)
        return
      }

      setFile(f)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      showErrorWithTips({
        response: { data: { detail: 'Por favor selecciona un archivo CSV' } },
      })
      return
    }

    if (!dateColumn || !targetColumn || !featureColumns) {
      showErrorWithTips({
        response: {
          data: {
            detail: 'Por favor completa todos los campos requeridos (Fecha, Target, Features)',
          },
        },
      })
      return
    }

    setLoading(true)

    try {
      const featureCols = featureColumns
        .split(',')
        .map((col) => col.trim())
        .filter((col) => col)

      const controlCols = controlColumns
        ? controlColumns
            .split(',')
            .map((col) => col.trim())
            .filter((col) => col)
        : undefined

      const response = await uploadData(
        file!,
        dateColumn,
        targetColumn,
        featureCols,
        controlCols
      )

      toast.success(
        `✓ Datos cargados: ${response.data.shape[0]} observaciones, ${response.data.shape[1]} columnas`,
        { duration: 4000 }
      )
      onSuccess()
    } catch (error: any) {
      showErrorWithTips(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h2" sx={{ mb: 1, fontWeight: 700 }}>
        Cargar Datos CSV
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Sube un archivo CSV con datos de marketing (mínimo 10 observaciones)
      </Typography>

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* File Input */}
          <Box>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{
                py: 2,
                border: '2px dashed',
                borderColor: 'primary.main',
                '&:hover': {
                  borderColor: 'secondary.main',
                  backgroundColor: 'rgba(102, 126, 234, 0.05)',
                },
              }}
            >
              Seleccionar Archivo CSV
              <input
                type="file"
                hidden
                accept=".csv"
                onChange={handleFileChange}
              />
            </Button>
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
              Tamaño máximo: 5 MB. Solo archivos .csv
            </Typography>
            {file && (
              <Chip
                icon={<CheckCircleIcon />}
                label={`${file.name} — ${(file.size / 1024 / 1024).toFixed(2)} MB`}
                color="success"
                variant="outlined"
                sx={{ mt: 1 }}
              />
            )}
          </Box>

          {/* Form Fields */}
          <TextField
            label="Columna de Fecha"
            placeholder="ej: Date"
            fullWidth
            value={dateColumn}
            onChange={(e) => setDateColumn(e.target.value)}
            required
            variant="outlined"
            helperText="Nombre exacto de la columna de fecha en tu CSV"
          />

          <TextField
            label="Columna Objetivo (Target)"
            placeholder="ej: Conversions, Sales"
            fullWidth
            value={targetColumn}
            onChange={(e) => setTargetColumn(e.target.value)}
            required
            variant="outlined"
            helperText="Variable que deseas predecir (ej: Conversions, Revenue)"
          />

          <TextField
            label="Columnas de Features (Canales)"
            placeholder="ej: Channel_A_Spend, Channel_B_Spend, Channel_C_Spend"
            fullWidth
            multiline
            rows={2}
            value={featureColumns}
            onChange={(e) => setFeatureColumns(e.target.value)}
            required
            variant="outlined"
            helperText="Variables independientes separadas por comas"
          />

          <TextField
            label="Columnas de Control (Opcional)"
            placeholder="ej: Seasonality_Index"
            fullWidth
            multiline
            rows={2}
            value={controlColumns}
            onChange={(e) => setControlColumns(e.target.value)}
            variant="outlined"
            helperText="Variables de control opcionales separadas por comas"
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || !file}
            startIcon={loading ? <CircularProgress size={20} /> : undefined}
          >
            {loading ? 'Cargando datos...' : 'Cargar Datos'}
          </Button>
        </Stack>
      </form>

      {/* Example Section */}
      <Paper sx={{ mt: 4, p: 3, backgroundColor: '#f5f7fa', borderLeft: '4px solid #667eea' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <InfoIcon sx={{ mr: 1, color: 'info.main' }} />
          <Typography variant="h3" sx={{ fontSize: '1.2rem', fontWeight: 600 }}>
            Formato Esperado
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ mb: 2 }}>
          Tu archivo CSV debe contener columnas numéricas y una columna de fecha:
        </Typography>

        <TableContainer component={Paper} elevation={0} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: '#e8eef7' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Channel_A_Spend</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Channel_B_Spend</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Conversions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>2024-01-01</TableCell>
                <TableCell>5000.00</TableCell>
                <TableCell>3000.00</TableCell>
                <TableCell>1200</TableCell>
              </TableRow>
              <TableRow sx={{ backgroundColor: '#fafbfc' }}>
                <TableCell>2024-02-01</TableCell>
                <TableCell>5200.50</TableCell>
                <TableCell>3100.25</TableCell>
                <TableCell>1350</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Alert severity="info" icon={<InfoIcon />}>
          <AlertTitle>💡 Consejos</AlertTitle>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Asegúrate de que los nombres de columnas sean exactos (mayúsculas y espacios)</li>
            <li>Todas las columnas de datos deben ser numéricas</li>
            <li>Se recomienda mínimo 30 observaciones para resultados confiables</li>
          </ul>
        </Alert>
      </Paper>
    </Box>
  )
}

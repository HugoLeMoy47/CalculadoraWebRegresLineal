import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { uploadData } from '../api/client'
import './DataUpload.css'

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
  const MAX_UPLOAD_BYTES = 5_000_000 // 5 MB (must match backend limit)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const f = e.target.files[0]

      if (f && f.size > MAX_UPLOAD_BYTES) {
        toast.error('Archivo demasiado grande. Tamaño máximo: 5 MB')
        // clear the input
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
      toast.error('Por favor selecciona un archivo CSV')
      return
    }

    if (!dateColumn || !targetColumn || !featureColumns) {
      toast.error('Por favor completa todos los campos requeridos')
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

      toast.success(`Datos cargados: ${response.data.shape[0]} observaciones`)
      onSuccess()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="upload-container">
      <h2>Cargar Datos CSV</h2>
      <p className="instruction">
        Sube un archivo CSV con datos de marketing (mínimo 10 observaciones)
      </p>

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="file">Archivo CSV</label>
          <input
            type="file"
            id="file"
            accept=".csv"
            onChange={handleFileChange}
            className="file-input"
            required
          />
          <small className="hint">Tamaño máximo: 5 MB. Formato: .csv</small>
          {file && (
            <p className="file-name">✓ {file.name} — {(file.size / 1024 / 1024).toFixed(2)} MB</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="dateColumn">Columna de Fecha *</label>
          <input
            type="text"
            id="dateColumn"
            placeholder="ej: Date"
            value={dateColumn}
            onChange={(e) => setDateColumn(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="targetColumn">Columna Objetivo (Target) *</label>
          <input
            type="text"
            id="targetColumn"
            placeholder="ej: Conversions, Sales"
            value={targetColumn}
            onChange={(e) => setTargetColumn(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="featureColumns">Columnas de Features (canales) *</label>
          <input
            type="text"
            id="featureColumns"
            placeholder="ej: Channel_A_Spend, Channel_B_Spend, Channel_C_Spend"
            value={featureColumns}
            onChange={(e) => setFeatureColumns(e.target.value)}
            required
          />
          <small>Separa múltiples columnas con comas</small>
        </div>

        <div className="form-group">
          <label htmlFor="controlColumns">Columnas de Control (opcional)</label>
          <input
            type="text"
            id="controlColumns"
            placeholder="ej: Seasonality_Index"
            value={controlColumns}
            onChange={(e) => setControlColumns(e.target.value)}
          />
          <small>Variables de control separadas por comas</small>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Cargando...' : 'Cargar Datos'}
        </button>
      </form>

      <div className="example-section">
        <h3>Formato esperado</h3>
        <p>El CSV debe contener columnas numéricas y una columna de fecha:</p>
        <table className="example-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Channel_A_Spend</th>
              <th>Channel_B_Spend</th>
              <th>Conversions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2024-01-01</td>
              <td>5000.00</td>
              <td>3000.00</td>
              <td>1200</td>
            </tr>
            <tr>
              <td>2024-02-01</td>
              <td>5200.50</td>
              <td>3100.25</td>
              <td>1350</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

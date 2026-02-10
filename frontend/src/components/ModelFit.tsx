import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { fitModel } from '../api/client'
import './ModelFit.css'

interface ModelFitProps {
  onSuccess: (results: any) => void
}

export default function ModelFit({ onSuccess }: ModelFitProps) {
  const [regularization, setRegularization] = useState<string>('none')
  const [alpha, setAlpha] = useState(1.0)
  const [bootstrapSamples, setBootstrapSamples] = useState(1000)
  const [loading, setLoading] = useState(false)
  const MAX_BOOTSTRAP = 5000 // must match backend limit

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (bootstrapSamples > MAX_BOOTSTRAP) {
      toast.error(`El número máximo de muestras bootstrap es ${MAX_BOOTSTRAP}`)
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
      toast.success('Modelo ajustado exitosamente')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Error al ajustar modelo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="model-fit-container">
      <h2>Ajuste de Modelo de Regresión</h2>
      <p className="subtitle">Configura los parámetros del modelo</p>

      <form onSubmit={handleSubmit} className="model-form">
        <div className="form-group">
          <label htmlFor="regularization">Tipo de Regularización</label>
          <select
            id="regularization"
            value={regularization}
            onChange={(e) => setRegularization(e.target.value)}
          >
            <option value="none">Sin regularización (OLS)</option>
            <option value="ridge">Ridge (L2)</option>
          </select>
          <small>
            OLS: Mínimos Cuadrados Ordinarios | Ridge: Añade penalización L2
          </small>
        </div>

        <div className={`form-group ${regularization === 'none' ? 'disabled' : ''}`}>
          <label htmlFor="alpha">
            Parámetro de Regularización (Alpha)
          </label>
          <input
            type="number"
            id="alpha"
            value={alpha}
            onChange={(e) => setAlpha(parseFloat(e.target.value))}
            min={0.01}
            step={0.1}
            disabled={regularization === 'none'}
          />
          <small>Solo aplicable para Ridge. Valores típicos: 0.1 - 10</small>
        </div>

        <div className="form-group">
          <label htmlFor="bootstrap">Muestras Bootstrap</label>
          <input
              type="number"
              id="bootstrap"
              value={bootstrapSamples}
              onChange={(e) => setBootstrapSamples(parseInt(e.target.value))}
              min={100}
              max={MAX_BOOTSTRAP}
              step={100}
            />
            <small>
              Para calcular intervalos de confianza. Valores típicos: 1000-5000. <strong>Máx:</strong> {MAX_BOOTSTRAP}
            </small>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Ajustando modelo...' : 'Ajustar Modelo'}
        </button>
      </form>

      <div className="info-section">
        <h3>ℹ️ Información sobre Regularización</h3>
        <div className="info-content">
          <h4>OLS (Ordinary Least Squares)</h4>
          <p>
            Método estándar que minimiza la suma de cuadrados de residuos.
            Sin penalización. Recomendado para la mayoría de casos.
          </p>

          <h4>Ridge Regression (L2)</h4>
          <p>
            Añade una penalización proporcional al cuadrado de los coeficientes.
            Útil para manejar multicolinealidad. Alpha mayor = mayor penalización.
          </p>

          <h4>Bootstrap</h4>
          <p>
            Se usan muestras bootstrap para calcular intervalos de confianza al 95%
            para los coeficientes estimados.
          </p>
        </div>
      </div>
    </div>
  )
}

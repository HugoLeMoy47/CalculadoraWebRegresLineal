import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { simulateScenario } from '../api/client'
import './ScenarioSimulator.css'

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
  // Filtrar para excluir 'const'
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
    // Filtrar cambios con valores != 0
    const activeChanges = Object.fromEntries(
      Object.entries(changes).filter(([, v]) => v !== 0)
    )

    if (Object.keys(activeChanges).length === 0) {
      toast.error('Por favor especifica al menos un cambio')
      return
    }

    setLoading(true)

    try {
      const response = await simulateScenario(activeChanges)
      setResult(response.data)
      toast.success('Simulación completada')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Error en simulación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="simulator-container">
      <h2>Simulador de Escenarios</h2>
      <p className="subtitle">
        Modifica los gastos por canal y visualiza el impacto predicho
      </p>

      <div className="simulator-content">
        {/* Panel de entrada */}
        <div className="input-panel">
          <h3>Cambios Porcentuales por Canal</h3>
          <div className="features-list">
            {featureFiltered.map((feature) => (
              <div key={feature} className="feature-input">
                <label htmlFor={`change-${feature}`}>{feature}</label>
                <div className="input-wrapper">
                  <input
                    id={`change-${feature}`}
                    type="number"
                    placeholder="0"
                    value={changes[feature] || ''}
                    onChange={(e) => handleChangeInput(feature, e.target.value)}
                  />
                  <span className="unit">%</span>
                </div>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={changes[feature] || 0}
                  onChange={(e) =>
                    handleChangeInput(feature, e.target.value)
                  }
                  className="slider"
                />
              </div>
            ))}
          </div>

          <div className="actions">
            <button
              onClick={handleSimulate}
              className="simulate-button"
              disabled={loading}
            >
              {loading ? 'Simulando...' : 'Simular Escenario'}
            </button>
            <button onClick={handleReset} className="reset-button">
              Restablecer
            </button>
          </div>
        </div>

        {/* Panel de resultados */}
        {result && (
          <div className="results-panel">
            <h3>Resultados de la Simulación</h3>

            <div className="result-cards">
              <div className="result-card baseline">
                <div className="card-label">Predicción Base</div>
                <div className="card-value">
                  {result.baseline_prediction.toFixed(2)}
                </div>
                <div className="card-desc">Escenario actual</div>
              </div>

              <div className="result-card scenario">
                <div className="card-label">Predicción Escenario</div>
                <div className="card-value">
                  {result.scenario_prediction.toFixed(2)}
                </div>
                <div className="card-desc">Con cambios aplicados</div>
              </div>

              <div className={`result-card delta ${result.delta >= 0 ? 'positive' : 'negative'}`}>
                <div className="card-label">Delta (Variación Absoluta)</div>
                <div className="card-value">
                  {result.delta >= 0 ? '+' : ''}
                  {result.delta.toFixed(2)}
                </div>
                <div className="card-desc">Diferencia en unidades</div>
              </div>

              <div className={`result-card percentage ${result.delta_percentage >= 0 ? 'positive' : 'negative'}`}>
                <div className="card-label">Cambio Porcentual</div>
                <div className="card-value">
                  {result.delta_percentage >= 0 ? '+' : ''}
                  {result.delta_percentage.toFixed(2)}%
                </div>
                <div className="card-desc">Variación relativa</div>
              </div>
            </div>

            {/* Tabla de cambios aplicados */}
            <div className="changes-table-container">
              <h4>Cambios Aplicados</h4>
              <table className="changes-table">
                <thead>
                  <tr>
                    <th>Variable</th>
                    <th>Cambio (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(result.changes_applied).map(([var_name, change]) => (
                    <tr key={var_name}>
                      <td className="var-name">{var_name}</td>
                      <td className={change >= 0 ? 'positive' : 'negative'}>
                        {change >= 0 ? '+' : ''}
                        {change.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Insights */}
            <div className="insights">
              <h4>💡 Insights</h4>
              <ul>
                <li>
                  {result.delta >= 0
                    ? `El cambio predicho generaría una mejora de ${Math.abs(result.delta).toFixed(2)} ${result.delta_percentage >= 0 ? '(+' : '('} ${result.delta_percentage.toFixed(2)}%)`
                    : `El cambio predicho resultaría en una reducción de ${Math.abs(result.delta).toFixed(2)} (${result.delta_percentage.toFixed(2)}%)`}
                </li>
                <li>
                  Predicción base (sin cambios): {result.baseline_prediction.toFixed(2)}
                </li>
                <li>
                  Nueva predicción (con cambios): {result.scenario_prediction.toFixed(2)}
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

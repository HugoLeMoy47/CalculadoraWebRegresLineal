import React from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts'
import './RegressionResults.css'

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

  return (
    <div className="results-container">
      <h2>Resultados de la Regresión</h2>

      {/* Métricas principales */}
      <section className="metrics-section">
        <h3>Métricas del Modelo</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-value">{data.r_squared.toFixed(4)}</div>
            <div className="metric-label">R² (ajuste del modelo)</div>
            <div className="metric-desc">
              Proporción de varianza explicada
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-value">
              {data.adjusted_r_squared.toFixed(4)}
            </div>
            <div className="metric-label">R² Ajustado</div>
            <div className="metric-desc">Ajustado por número de variables</div>
          </div>

          <div className="metric-card">
            <div className="metric-value">{data.f_statistic.toFixed(2)}</div>
            <div className="metric-label">F-estadístico</div>
            <div className="metric-desc">
              p-value: {data.f_pvalue.toFixed(4)}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-value">{data.observations}</div>
            <div className="metric-label">Observaciones</div>
            <div className="metric-desc">Número de datos usados</div>
          </div>

          <div className="metric-card">
            <div className="metric-value">{data.aic.toFixed(2)}</div>
            <div className="metric-label">AIC</div>
            <div className="metric-desc">Criterio de información</div>
          </div>

          <div className="metric-card">
            <div className="metric-value">{data.bic.toFixed(2)}</div>
            <div className="metric-label">BIC</div>
            <div className="metric-desc">Criterio de información bayesiano</div>
          </div>
        </div>
      </section>

      {/* Coeficientes */}
      <section className="coefficients-section">
        <h3>Coeficientes de Regresión</h3>
        <table className="coefficients-table">
          <thead>
            <tr>
              <th>Variable</th>
              <th>Coeficiente</th>
              <th>P-value</th>
              <th>Significancia</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.coefficients).map(([name, coef]) => {
              const pval = data.p_values[name] || 1
              const isSignificant = pval < 0.05
              return (
                <tr key={name}>
                  <td className="var-name">{name}</td>
                  <td>{parseFloat(coef.toFixed(6))}</td>
                  <td>{pval.toFixed(4)}</td>
                  <td className={isSignificant ? 'significant' : 'not-significant'}>
                    {isSignificant ? '***' : 'ns'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p className="significance-note">
          *** p &lt; 0.05 (significante) | ns = no significante
        </p>
      </section>

      {/* Gráfico de coeficientes */}
      <section className="chart-section">
        <h3>Magnitud de Coeficientes</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={coefficientData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="coeficiente" fill="#667eea" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* VIF - Multicolinealidad */}
      {vifData.length > 0 && (
        <section className="vif-section">
          <h3>VIF (Variance Inflation Factor) - Multicolinealidad</h3>
          {significantVif.length > 0 && (
            <div className="warning-box">
              ⚠️ Se detectó multicolinealidad en: {significantVif.map((v) => v.name).join(', ')}
              <p>Considera usar Ridge Regression o eliminar variables correlacionadas.</p>
            </div>
          )}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vifData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="vif" fill="#ff6b6b" />
            </BarChart>
          </ResponsiveContainer>
          <p className="vif-note">VIF &gt; 10 indica multicolinealidad potencial</p>
        </section>
      )}

      {/* Residuos */}
      <section className="residuals-section">
        <h3>Análisis de Residuos</h3>
        <div className="residuals-grid">
          <div className="residual-stat">
            <div className="stat-value">
              {(data.residuals.reduce((a, b) => a + b, 0) / data.residuals.length).toFixed(4)}
            </div>
            <div className="stat-label">Media de Residuos</div>
            <p className="stat-desc">Idealmente debe ser ≈ 0</p>
          </div>
          <div className="residual-stat">
            <div className="stat-value">
              {Math.sqrt(
                data.residuals.reduce((a, b) => a + b ** 2, 0) / data.residuals.length
              ).toFixed(4)}
            </div>
            <div className="stat-label">Desv. Est. de Residuos</div>
            <p className="stat-desc">Variabilidad no explicada</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fitted" name="Valores Ajustados" />
            <YAxis dataKey="residual" name="Residuos" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Residuos" data={residualData} fill="#82ca9d" />
          </ScatterChart>
        </ResponsiveContainer>
      </section>
    </div>
  )
}

import React, { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import DataUpload from './components/DataUpload'
import ModelFit from './components/ModelFit'
import RegressionResults from './components/RegressionResults'
import ScenarioSimulator from './components/ScenarioSimulator'
import './App.css'

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

function App() {
  const [dataLoaded, setDataLoaded] = useState(false)
  const [regressionResults, setRegressionResults] = useState<RegressionData | null>(null)
  const [activeTab, setActiveTab] = useState('upload')

  const handleDataUpload = () => {
    setDataLoaded(true)
    setActiveTab('fit')
    toast.success('Datos cargados exitosamente')
  }

  const handleModelFit = (results: RegressionData) => {
    setRegressionResults(results)
    setActiveTab('results')
    toast.success('Modelo ajustado exitosamente')
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="container">
        <header className="header">
          <h1>📊 Calculadora de Atribución Marketing</h1>
          <p>MVP basado en Regresión Lineal Múltiple</p>
        </header>

        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            1. Cargar Datos
          </button>
          <button
            className={`tab-button ${activeTab === 'fit' ? 'active' : ''}`}
            onClick={() => setActiveTab('fit')}
            disabled={!dataLoaded}
          >
            2. Ajustar Modelo
          </button>
          <button
            className={`tab-button ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => setActiveTab('results')}
            disabled={!regressionResults}
          >
            3. Resultados
          </button>
          <button
            className={`tab-button ${activeTab === 'simulate' ? 'active' : ''}`}
            onClick={() => setActiveTab('simulate')}
            disabled={!regressionResults}
          >
            4. Simulación
          </button>
        </div>

        <main className="content">
          {activeTab === 'upload' && <DataUpload onSuccess={handleDataUpload} />}
          {activeTab === 'fit' && dataLoaded && (
            <ModelFit onSuccess={handleModelFit} />
          )}
          {activeTab === 'results' && regressionResults && (
            <RegressionResults data={regressionResults} />
          )}
          {activeTab === 'simulate' && regressionResults && (
            <ScenarioSimulator features={Object.keys(regressionResults.coefficients)} />
          )}
        </main>

        <footer className="footer">
          <p>Marketing Attribution Calculator © 2024</p>
        </footer>
      </div>
    </>
  )
}

export default App

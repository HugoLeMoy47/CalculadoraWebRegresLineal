"""API FastAPI para calculadora de atribución marketing."""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
from typing import Optional
import traceback

from .models import (
    ColumnMapping, FitRequest, ScenarioRequest, RegressionResults, SimulationResult
)
from .utils import DataProcessor, RegressionFitter, Simulator

# Inicializar FastAPI
app = FastAPI(
    title="Marketing Attribution Calculator",
    description="MVP para atribución de marketing basada en regresión lineal",
    version="0.1.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Estado global
processor = None
fitter = None
simulator = None


@app.get("/")
def root():
    """Endpoint raíz."""
    return {
        "message": "Marketing Attribution Calculator API",
        "version": "0.1.0",
        "endpoints": {
            "upload": "POST /upload",
            "fit": "POST /fit",
            "simulate": "POST /simulate",
            "status": "GET /status"
        }
    }


@app.get("/status")
def status():
    """Retorna el estado actual de los datos cargados."""
    if processor is None or processor.data is None:
        return {"status": "no_data", "message": "No hay datos cargados"}
    
    return {
        "status": "ready",
        "observations": len(processor.data),
        "date_column": processor.date_column,
        "target_column": processor.target_column,
        "feature_columns": processor.feature_columns,
        "control_columns": processor.control_columns
    }


@app.post("/upload")
async def upload_data(
    file: UploadFile = File(...),
    date_column: str = Form(...),
    target_column: str = Form(...),
    feature_columns: str = Form(...),
    control_columns: Optional[str] = Form(None)
):
    """
    Carga un archivo CSV y mapea las columnas.
    
    Args:
        file: Archivo CSV
        date_column: Nombre de la columna de fecha
        target_column: Nombre de la columna objetivo
        feature_columns: Columnas de features (separadas por comas)
        control_columns: Columnas de control (separadas por comas, opcional)
    """
    global processor
    
    try:
        # Leer CSV
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        # Parsear columnas
        feature_cols = [col.strip() for col in feature_columns.split(',')]
        control_cols = None
        if control_columns:
            control_cols = [col.strip() for col in control_columns.split(',')]
        
        # Crear y cargar datos
        processor = DataProcessor()
        processor.load_data(
            df,
            date_col=date_column,
            target_col=target_column,
            feature_cols=feature_cols,
            control_cols=control_cols
        )
        
        return {
            "status": "success",
            "message": f"Datos cargados: {len(df)} observaciones",
            "columns": list(df.columns),
            "shape": df.shape,
            "date_range": f"{processor.data[date_column].min()} to {processor.data[date_column].max()}"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error al cargar datos: {str(e)}"
        )


@app.post("/fit")
def fit_model(request: FitRequest):
    """
    Ajusta el modelo de regresión lineal.
    
    Args:
        request: Parámetros de regresión (regularización, alpha, bootstrap_samples)
    """
    global processor, fitter, simulator
    
    try:
        if processor is None or processor.data is None:
            raise ValueError("No hay datos cargados. Use /upload primero")
        
        # Ajustar modelo
        fitter = RegressionFitter(processor)
        results = fitter.fit(
            regularization=request.regularization,
            alpha=request.alpha or 1.0,
            bootstrap_samples=request.bootstrap_samples or 1000
        )
        
        # Inicializar simulador
        simulator = Simulator(fitter)
        
        # Detectar multicolinealidad
        high_vif = {}
        if results['vif_values']:
            high_vif = {k: v for k, v in results['vif_values'].items() if v > 10}
        
        return {
            "status": "success",
            "message": "Modelo ajustado correctamente",
            "coefficients": results['coefficients'],
            "p_values": results['p_values'],
            "r_squared": results['r_squared'],
            "adjusted_r_squared": results['adjusted_r_squared'],
            "vif_values": results['vif_values'],
            "high_vif_alert": high_vif if high_vif else None,
            "aic": results['aic'],
            "bic": results['bic'],
            "f_statistic": results['f_statistic'],
            "f_pvalue": results['f_pvalue'],
            "observations": results['observations'],
            "residuals_mean": float(sum(results['residuals']) / len(results['residuals'])),
            "residuals_std": float((sum([(r - sum(results['residuals']) / len(results['residuals']))**2 for r in results['residuals']]) / len(results['residuals']))**0.5),
            "fitted_values": results['fitted_values'],
            "residuals": results['residuals'],
            "bootstrap_ci": results.get('bootstrap_ci', {})
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error al ajustar modelo: {str(e)}\n{traceback.format_exc()}"
        )


@app.post("/simulate")
def simulate_scenario(request: ScenarioRequest):
    """
    Simula un escenario de cambios en variables.
    
    Args:
        request: Cambios porcentuales por variable
    """
    global simulator
    
    try:
        if simulator is None:
            raise ValueError("Modelo no ajustado. Use /fit primero")
        
        result = simulator.simulate(request.changes)
        
        return {
            "status": "success",
            "baseline_prediction": result['baseline_prediction'],
            "scenario_prediction": result['scenario_prediction'],
            "delta": result['delta'],
            "delta_percentage": result['delta_percentage'],
            "changes_applied": result['changes_applied']
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error en simulación: {str(e)}"
        )


@app.post("/metrics")
def get_metrics():
    """Retorna métricas adicionales."""
    global processor, fitter
    
    if fitter is None:
        raise HTTPException(status_code=400, detail="Modelo no ajustado")
    
    return {
        "observations": fitter.model.nobs,
        "residuals_mean": float(fitter.residuals.mean()),
        "residuals_std": float(fitter.residuals.std()),
        "fitted_mean": float(fitter.fitted_values.mean()),
        "fitted_std": float(fitter.fitted_values.std())
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

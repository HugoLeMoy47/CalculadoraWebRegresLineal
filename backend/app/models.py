"""Modelos de datos para la calculadora de atribución marketing."""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class ColumnMapping(BaseModel):
    """Mapeo de columnas del CSV."""
    date_column: str = Field(..., description="Nombre de la columna de fecha")
    target_column: str = Field(..., description="Nombre de la columna objetivo (conversiones/ventas)")
    feature_columns: List[str] = Field(..., description="Columnas de características (canales/gastos)")
    control_columns: Optional[List[str]] = Field(default=None, description="Columnas de control")


class FitRequest(BaseModel):
    """Solicitud para ajustar el modelo."""
    regularization: Optional[str] = Field(default=None, description="Tipo de regularización: 'ridge' o None")
    alpha: Optional[float] = Field(default=1.0, description="Parámetro de regularización (para Ridge)")
    bootstrap_samples: Optional[int] = Field(default=1000, description="Número de muestras bootstrap para intervalos")


class ScenarioRequest(BaseModel):
    """Solicitud para simulación de escenarios."""
    changes: Dict[str, float] = Field(..., description="Cambios porcentuales por variable. Ej: {'Channel_A': 10}")


class RegressionResults(BaseModel):
    """Resultados de la regresión lineal."""
    coefficients: Dict[str, float]
    p_values: Dict[str, float]
    r_squared: float
    adjusted_r_squared: float
    vif_values: Optional[Dict[str, float]] = None
    residuals: List[float]
    fitted_values: List[float]
    aic: float
    bic: float
    f_statistic: float
    f_pvalue: float
    observations: int
    model_summary: Optional[str] = None


class PredictionResult(BaseModel):
    """Resultado de predicción."""
    predicted_value: float
    confidence_interval_lower: Optional[float] = None
    confidence_interval_upper: Optional[float] = None


class SimulationResult(BaseModel):
    """Resultado de simulación de escenario."""
    baseline_prediction: float
    scenario_prediction: float
    delta: float
    delta_percentage: float
    changes_applied: Dict[str, float]

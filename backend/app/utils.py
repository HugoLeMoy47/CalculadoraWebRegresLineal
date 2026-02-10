"""Utilidades para procesamiento de datos y regresión lineal."""

import numpy as np
import pandas as pd
from typing import Optional, Tuple, Dict, Any
import statsmodels.api as sm
from statsmodels.stats.outliers_influence import variance_inflation_factor
from sklearn.preprocessing import StandardScaler
import warnings

warnings.filterwarnings('ignore')
import logging

logger = logging.getLogger("attribution_utils")


class DataProcessor:
    """Procesador de datos para la calculadora de atribución marketing."""
    
    def __init__(self):
        self.data = None
        self.original_data = None
        self.feature_columns = None
        self.control_columns = None
        self.date_column = None
        self.target_column = None
        self.scaler = StandardScaler()
        
    def load_data(self, df: pd.DataFrame, date_col: str, target_col: str, 
                  feature_cols: list, control_cols: Optional[list] = None) -> None:
        """Carga y valida los datos."""
        # Validación básica
        if len(df) < 10:
            raise ValueError(f"Mínimo 10 observaciones requeridas, se encontraron {len(df)}")
        
        # Verificar que todas las columnas existen
        required_cols = [date_col, target_col] + feature_cols
        if control_cols:
            required_cols.extend(control_cols)
        
        missing_cols = set(required_cols) - set(df.columns)
        if missing_cols:
            raise ValueError(f"Columnas no encontradas: {missing_cols}")
        
        # Convertir fechas
        try:
            df[date_col] = pd.to_datetime(df[date_col])
        except Exception as e:
            raise ValueError(f"Error al convertir columna de fecha: {str(e)}")
        
        # Ordenar por fecha
        df = df.sort_values(date_col).reset_index(drop=True)
        
        # Almacenar referencias
        self.original_data = df.copy()
        self.date_column = date_col
        self.target_column = target_col
        self.feature_columns = feature_cols
        self.control_columns = control_cols or []
        
        # Procesar datos
        self.data = self._preprocess_data(df)
    
    def _preprocess_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Preprocesa los datos: manejo de NaNs, validación de tipos."""
        df = df.copy()
        
        # Convertir a numérico
        numeric_cols = [self.target_column] + self.feature_columns + self.control_columns
        for col in numeric_cols:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        
        # Manejo de NaNs
        # Realizar interpolación lineal para NaNs en el medio
        for col in numeric_cols:
            df[col] = df[col].interpolate(method='linear', limit_direction='both')
            # Si aún hay NaNs, rellenar con la media
            if df[col].isna().any():
                df[col].fillna(df[col].mean(), inplace=True)
        
        return df
    
    def get_regression_data(self) -> Tuple[np.ndarray, np.ndarray]:
        """Obtiene X (features + controles) e y (target) para regresión."""
        if self.data is None:
            raise ValueError("Datos no cargados")
        
        all_feature_cols = self.feature_columns + self.control_columns
        
        # Validar que hay suficientes observaciones por variable
        if len(self.data) < max(10, len(all_feature_cols) * 10):
            raise ValueError(
                f"Insuficientes observaciones ({len(self.data)}) para el número de variables ({len(all_feature_cols)})"
            )
        
        X = self.data[all_feature_cols].values
        y = self.data[self.target_column].values
        
        return X, y
    
    def get_dates(self) -> np.ndarray:
        """Retorna array de fechas."""
        return self.data[self.date_column].values
    
    def get_feature_names(self) -> list:
        """Retorna nombres de features incluyendo controles."""
        return self.feature_columns + self.control_columns


class RegressionFitter:
    """Ajusta modelos de regresión lineal con opciones de regularización."""
    
    def __init__(self, data_processor: DataProcessor):
        self.processor = data_processor
        self.model = None
        self.fitted_values = None
        self.residuals = None
        self.vif_values = None
        self.bootstrap_ci = {}
        
    def fit(self, regularization: Optional[str] = None, alpha: float = 1.0,
            bootstrap_samples: int = 1000) -> Dict[str, Any]:
        """Ajusta el modelo de regresión."""
        X, y = self.processor.get_regression_data()
        feature_names = self.processor.get_feature_names()
        
        # Agregar constante
        X = sm.add_constant(X)
        
        # Ajustar modelo
        if regularization and regularization.lower() == 'ridge':
            # Ridge regression
            from sklearn.linear_model import Ridge
            ridge = Ridge(alpha=alpha)
            ridge.fit(X[:, 1:], y)  # Sin la constante
            
            # Crear resultado compatible con OLS
            self.fitted_values = ridge.predict(X[:, 1:])
            coef = np.concatenate([[ridge.intercept_], ridge.coef_])
            
            # Calcular estadísticas manualmente
            self.model = self._create_ridge_summary(X, y, coef, feature_names)
        else:
            # OLS estándar
            self.model = sm.OLS(y, X).fit()
            self.fitted_values = self.model.fittedvalues
        
        self.residuals = y - self.fitted_values
        
        # Calcular VIF (para features, no para controles)
        self.vif_values = self._calculate_vif(X, feature_names)
        
        # Bootstrap para intervalos de confianza
        if bootstrap_samples and bootstrap_samples > 0:
            # evitar uso excesivo de CPU/memoria si el usuario pasa un valor enorme
            max_allowed = 5000
            n_bs = min(int(bootstrap_samples), max_allowed)
            if int(bootstrap_samples) > max_allowed:
                logger.warning(f"bootstrap_samples reducido a {max_allowed} por seguridad")
            self.bootstrap_ci = self._bootstrap_ci(X, y, n_bs)
        
        return self._get_results()
    
    def _create_ridge_summary(self, X, y, coef, feature_names):
        """Crea un objeto de resumen compatible con OLS para Ridge."""
        from sklearn.metrics import r2_score, mean_squared_error
        from scipy import stats
        
        predictions = X @ coef
        residuals = y - predictions
        rss = np.sum(residuals ** 2)
        tss = np.sum((y - np.mean(y)) ** 2)
        r2 = r2_score(y, predictions)
        
        class RidgeSummary:
            def __init__(self):
                self.params = pd.Series(coef, index=['const'] + feature_names)
                self.pvalues = pd.Series([np.nan] * len(coef), index=['const'] + feature_names)
                self.rsquared = r2
                self.rsquared_adj = 1 - (1 - r2) * (len(y) - 1) / (len(y) - len(coef))
                self.aic = len(y) * np.log(rss / len(y)) + 2 * len(coef)
                self.bic = len(y) * np.log(rss / len(y)) + np.log(len(y)) * len(coef)
                self.fvalue = (tss - rss) / (len(coef) - 1) / (rss / (len(y) - len(coef)))
                self.f_pvalue = 1 - stats.f.cdf(self.fvalue, len(coef) - 1, len(y) - len(coef))
                self.nobs = len(y)
                self.fittedvalues = predictions
        
        return RidgeSummary()
    
    def _calculate_vif(self, X: np.ndarray, feature_names: list) -> Dict[str, float]:
        """Calcula VIF para detectar multicolinealidad."""
        vif_dict = {}
        
        try:
            # Sin la constante (primer valor)
            X_features = X[:, 1:]
            feature_names_clean = feature_names
            
            for i in range(X_features.shape[1]):
                # Solo calcular para features, no para controles
                if i < len(self.processor.feature_columns):
                    try:
                        vif_value = variance_inflation_factor(X_features, i)
                        vif_dict[feature_names_clean[i]] = float(vif_value)
                    except Exception as e:
                        logger.exception(f"Error calculando VIF para {feature_names_clean[i]}")
                        vif_dict[feature_names_clean[i]] = float('nan')
        except Exception as e:
            logger.exception(f"Error calculando VIF: {str(e)}")
        
        return vif_dict
    
    def _bootstrap_ci(self, X: np.ndarray, y: np.ndarray, n_samples: int = 1000) -> Dict[str, Tuple[float, float]]:
        """Calcula intervalos de confianza usando bootstrap."""
        n = len(y)
        coef_samples = []
        
        np.random.seed(42)
        for _ in range(n_samples):
            # Muestreo con reemplazo
            indices = np.random.choice(n, size=n, replace=True)
            X_boot = X[indices]
            y_boot = y[indices]
            
            try:
                model_boot = sm.OLS(y_boot, X_boot).fit()
                coef_samples.append(model_boot.params.values)
            except:
                continue
        
        if len(coef_samples) == 0:
            logger.warning("Bootstrap no pudo generar muestras válidas; devolviendo dict vacío")
            return {}

        coef_samples = np.array(coef_samples)
        ci_dict = {}
        
        for i, name in enumerate(['const'] + self.processor.get_feature_names()):
            if i < len(coef_samples[0]):
                lower = np.percentile(coef_samples[:, i], 2.5)
                upper = np.percentile(coef_samples[:, i], 97.5)
                ci_dict[name] = (float(lower), float(upper))
        
        return ci_dict
    
    def _get_results(self) -> Dict[str, Any]:
        """Retorna los resultados de la regresión."""
        feature_names = ['const'] + self.processor.get_feature_names()
        
        coefficients = dict(zip(feature_names, self.model.params.values))
        p_values = dict(zip(feature_names, self.model.pvalues.values))
        
        results = {
            'coefficients': coefficients,
            'p_values': p_values,
            'r_squared': float(self.model.rsquared),
            'adjusted_r_squared': float(self.model.rsquared_adj),
            'vif_values': self.vif_values,
            'residuals': self.residuals.tolist(),
            'fitted_values': self.fitted_values.tolist(),
            'aic': float(self.model.aic),
            'bic': float(self.model.bic),
            'f_statistic': float(self.model.fvalue),
            'f_pvalue': float(self.model.f_pvalue),
            'observations': int(self.model.nobs),
            'bootstrap_ci': self.bootstrap_ci
        }
        
        return results


class Simulator:
    """Simulador de escenarios de atribución marketing."""
    
    def __init__(self, model_fitter: RegressionFitter):
        self.fitter = model_fitter
        self.processor = model_fitter.processor
        self.model = model_fitter.model
        
    def simulate(self, percentage_changes: Dict[str, float]) -> Dict[str, Any]:
        """
        Simula cambios en las variables.
        
        Args:
            percentage_changes: Dict con cambios porcentuales. Ej: {'Channel_A': 10}
        
        Returns:
            Dict con predicción base, de escenario y delta.
        """
        X, y = self.processor.get_regression_data()
        feature_names = self.processor.get_feature_names()
        
        # Predicción base (media)
        X_mean = X.mean(axis=0)
        X_base = np.concatenate([[1], X_mean])  # Add constant
        baseline_pred = self.model.params.values @ X_base
        
        # Crear escenario
        X_scenario = X_mean.copy()
        changes_applied = {}
        
        for feature, pct_change in percentage_changes.items():
            if feature in feature_names:
                idx = feature_names.index(feature)
                change_amount = X_scenario[idx] * (pct_change / 100)
                X_scenario[idx] += change_amount
                changes_applied[feature] = pct_change
            else:
                raise ValueError(f"Feature no encontrada: {feature}")
        
        X_scenario_full = np.concatenate([[1], X_scenario])
        scenario_pred = self.model.params.values @ X_scenario_full
        
        delta = scenario_pred - baseline_pred
        delta_pct = (delta / baseline_pred * 100) if baseline_pred != 0 else 0
        
        return {
            'baseline_prediction': float(baseline_pred),
            'scenario_prediction': float(scenario_pred),
            'delta': float(delta),
            'delta_percentage': float(delta_pct),
            'changes_applied': changes_applied
        }

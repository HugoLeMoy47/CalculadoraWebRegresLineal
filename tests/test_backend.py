"""Tests unitarios para utilidades de preprocesado y regresión."""

import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

import sys
sys.path.insert(0, str(__file__).replace('tests\\test_backend.py', 'backend'))

from backend.app.utils import DataProcessor, RegressionFitter


class TestDataProcessor:
    """Tests para DataProcessor."""
    
    @pytest.fixture
    def sample_data(self):
        """Crea datos de ejemplo para pruebas."""
        date_range = pd.date_range(start='2024-01-01', periods=12, freq='M')
        data = {
            'Date': date_range,
            'Sales': np.random.randint(1000, 5000, 12),
            'Channel_A': np.random.randint(100, 500, 12),
            'Channel_B': np.random.randint(100, 500, 12),
            'Control_1': np.random.rand(12) * 10
        }
        return pd.DataFrame(data)
    
    def test_load_data_success(self, sample_data):
        """Test carga exitosa de datos."""
        processor = DataProcessor()
        processor.load_data(
            sample_data,
            date_col='Date',
            target_col='Sales',
            feature_cols=['Channel_A', 'Channel_B'],
            control_cols=['Control_1']
        )
        
        assert processor.data is not None
        assert len(processor.data) == 12
        assert processor.date_column == 'Date'
        assert processor.target_column == 'Sales'
        assert processor.feature_columns == ['Channel_A', 'Channel_B']
        assert processor.control_columns == ['Control_1']
    
    def test_insufficient_observations(self):
        """Test con insuficientes observaciones."""
        small_data = pd.DataFrame({
            'Date': pd.date_range('2024-01-01', periods=5),
            'Sales': [100, 200, 150, 180, 220],
            'Channel_A': [50, 60, 55, 70, 65]
        })
        
        processor = DataProcessor()
        with pytest.raises(ValueError, match="Mínimo 10 observaciones"):
            processor.load_data(
                small_data,
                date_col='Date',
                target_col='Sales',
                feature_cols=['Channel_A']
            )
    
    def test_missing_columns(self, sample_data):
        """Test con columnas faltantes."""
        processor = DataProcessor()
        with pytest.raises(ValueError, match="Columnas no encontradas"):
            processor.load_data(
                sample_data,
                date_col='Date',
                target_col='Sales',
                feature_cols=['NonExistentColumn']
            )
    
    def test_nan_handling(self):
        """Test manejo de NaNs."""
        data = pd.DataFrame({
            'Date': pd.date_range('2024-01-01', periods=12, freq='M'),
            'Sales': [100, np.nan, 150, 180, np.nan, 200, 220, 250, 230, 210, 190, 180],
            'Channel_A': [50, 60, np.nan, 70, 65, 75, 80, 85, 82, 78, 72, 68]
        })
        
        processor = DataProcessor()
        processor.load_data(
            data,
            date_col='Date',
            target_col='Sales',
            feature_cols=['Channel_A']
        )
        
        # Verificar que no hay NaNs después del procesamiento
        assert not processor.data['Sales'].isna().any()
        assert not processor.data['Channel_A'].isna().any()
    
    def test_get_regression_data(self, sample_data):
        """Test obtención de datos para regresión."""
        processor = DataProcessor()
        processor.load_data(
            sample_data,
            date_col='Date',
            target_col='Sales',
            feature_cols=['Channel_A', 'Channel_B'],
            control_cols=['Control_1']
        )
        
        X, y = processor.get_regression_data()
        
        assert X.shape == (12, 3)  # 2 features + 1 control
        assert y.shape == (12,)


class TestRegressionFitter:
    """Tests para RegressionFitter."""
    
    @pytest.fixture
    def fitted_model(self):
        """Crea un modelo ajustado para pruebas."""
        # Crear datos sintéticos con relación conocida
        np.random.seed(42)
        n = 24
        dates = pd.date_range('2024-01-01', periods=n, freq='M')
        X_a = np.random.rand(n) * 100
        X_b = np.random.rand(n) * 100
        y = 1000 + 2 * X_a + 3 * X_b + np.random.randn(n) * 50
        
        data = pd.DataFrame({
            'Date': dates,
            'Sales': y,
            'Channel_A': X_a,
            'Channel_B': X_b
        })
        
        processor = DataProcessor()
        processor.load_data(
            data,
            date_col='Date',
            target_col='Sales',
            feature_cols=['Channel_A', 'Channel_B']
        )
        
        fitter = RegressionFitter(processor)
        fitter.fit()
        
        return fitter
    
    def test_fit_ols(self, fitted_model):
        """Test ajuste OLS."""
        assert fitted_model.model is not None
        assert fitted_model.residuals is not None
        assert fitted_model.fitted_values is not None
    
    def test_coefficients_shape(self, fitted_model):
        """Test que los coeficientes tienen la forma correcta."""
        n_features = len(fitted_model.processor.feature_columns) + len(fitted_model.processor.control_columns) + 1
        assert len(fitted_model.model.params) == n_features
    
    def test_r_squared_reasonable(self, fitted_model):
        """Test que R² está en rango válido."""
        r2 = fitted_model.model.rsquared
        assert 0 <= r2 <= 1
    
    def test_vif_values_present(self, fitted_model):
        """Test que VIF está calculado."""
        assert fitted_model.vif_values is not None or len(fitted_model.vif_values) == 0
    
    def test_residuals_shape(self, fitted_model):
        """Test forma de residuos."""
        assert len(fitted_model.residuals) == len(fitted_model.processor.data)
    
    def test_bootstrap_ci(self, fitted_model):
        """Test intervalos de confianza bootstrap."""
        assert fitted_model.bootstrap_ci is not None


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

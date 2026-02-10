#!/usr/bin/env python
"""Script simple para verificar que el error de .values está corregido."""

import sys
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

sys.path.insert(0, 'backend')

from app.utils import DataProcessor, RegressionFitter, Simulator

# Crear datos de ejemplo
date_range = pd.date_range(start='2024-01-01', periods=24, freq='M')
np.random.seed(42)

# Crear relación real: Sales = 100 + 0.5*Channel_A + 0.3*Channel_B + 20*Control
channel_a = np.random.randint(100, 500, 24)
channel_b = np.random.randint(100, 500, 24)
control = np.random.rand(24) * 10
sales = 100 + 0.5*channel_a + 0.3*channel_b + 20*control + np.random.randn(24)*50

data = pd.DataFrame({
    'Date': date_range,
    'Sales': sales,
    'Channel_A': channel_a,
    'Channel_B': channel_b,
    'Control': control
})

print("✓ Datos creados")
print(f"  Observaciones: {len(data)}")

# Test 1: DataProcessor
try:
    processor = DataProcessor()
    processor.load_data(
        data,
        date_col='Date',
        target_col='Sales',
        feature_cols=['Channel_A', 'Channel_B'],
        control_cols=['Control']
    )
    print("✓ DataProcessor cargó datos exitosamente")
except Exception as e:
    print(f"✗ Error en DataProcessor: {e}")
    sys.exit(1)

# Test 2: Fitting OLS
try:
    fitter = RegressionFitter(processor)
    results = fitter.fit(regularization=None, alpha=1.0, bootstrap_samples=100)
    print("✓ Ajuste OLS completado")
    print(f"  R²: {results['r_squared']:.4f}")
    print(f"  Coeficientes: {list(results['coefficients'].keys())}")
except Exception as e:
    print(f"✗ Error en fitting OLS: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 3: Fitting Ridge
try:
    fitter_ridge = RegressionFitter(processor)
    results_ridge = fitter_ridge.fit(regularization='ridge', alpha=0.5, bootstrap_samples=100)
    print("✓ Ajuste Ridge completado")
    print(f"  R²: {results_ridge['r_squared']:.4f}")
except Exception as e:
    print(f"✗ Error en fitting Ridge: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 4: Simulación
try:
    simulator = Simulator(fitter)
    sim_result = simulator.simulate({'Channel_A': 10, 'Channel_B': -5})
    print("✓ Simulación completada")
    print(f"  Predicción base: {sim_result['baseline_prediction']:.2f}")
    print(f"  Predicción escenario: {sim_result['scenario_prediction']:.2f}")
    print(f"  Delta: {sim_result['delta']:.2f} ({sim_result['delta_percentage']:.2f}%)")
except Exception as e:
    print(f"✗ Error en simulación: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n✅ ¡TODOS LOS TESTS PASARON! El error de '.values' está corregido.")

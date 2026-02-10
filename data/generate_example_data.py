"""Script para generar dataset sintético de ejemplo."""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Configurar semilla para reproducibilidad
np.random.seed(42)

# Parámetros
n_months = 12
start_date = datetime(2024, 1, 1)

# Generar dates
dates = pd.date_range(start=start_date, periods=n_months, freq='MS')

# Generar datos de canales con tendencia
channel_a = 5000 + np.linspace(0, 1000, n_months) + np.random.randn(n_months) * 300
channel_b = 3000 + np.linspace(0, 500, n_months) + np.random.randn(n_months) * 200
channel_c = 2000 - np.linspace(0, 300, n_months) + np.random.randn(n_months) * 150

# Generar variable de control (seasonality proxy)
seasonality = 100 * np.sin(np.linspace(0, 2 * np.pi, n_months))

# Generar target (conversiones/ventas) con relación conocida
# Sales = 500 + 0.15*Channel_A + 0.25*Channel_B + 0.10*Channel_C + seasonality_effect + error
target = (500 + 
          0.15 * channel_a + 
          0.25 * channel_b + 
          0.10 * channel_c + 
          seasonality + 
          np.random.randn(n_months) * 100)

# Asegurar valores positivos
channel_a = np.maximum(channel_a, 100)
channel_b = np.maximum(channel_b, 100)
channel_c = np.maximum(channel_c, 100)
target = np.maximum(target, 100)

# Crear DataFrame
data = pd.DataFrame({
    'Date': dates,
    'Channel_A_Spend': channel_a.round(2),
    'Channel_B_Spend': channel_b.round(2),
    'Channel_C_Spend': channel_c.round(2),
    'Conversions': target.round(0).astype(int),
    'Seasonality_Index': seasonality.round(2)
})

# Guardar CSV
output_path = 'example_data.csv'
data.to_csv(output_path, index=False)

print(f"Dataset sintético generado: {output_path}")
print(f"\nResumen de datos:")
print(data)
print(f"\nEstadísticas:")
print(data.describe())

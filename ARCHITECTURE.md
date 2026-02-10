# 🏗️ Arquitectura del Proyecto

## Visión General

Marketing Attribution Calculator es una aplicación de dos capas construida con:

```
┌─────────────────────────────────────────────────────────┐
│             Frontend (React + Vite)                     │
│  - UI interactiva con gráficos (Recharts)              │
│  - Gestión de estado local                             │
│  - Cliente HTTP (Axios) para conectar con backend      │
└────────────────────────────────────────────────────────┘
                          ↓ HTTP/REST
┌─────────────────────────────────────────────────────────┐
│             Backend (FastAPI + Python)                  │
│  - Endpoints REST para carga, ajuste, simulación       │
│  - Procesamiento de datos con Pandas                    │
│  - Modelos estadísticos con Statsmodels               │
│  - Regularización con Scikit-learn                     │
└─────────────────────────────────────────────────────────┘
```

## Backend - Arquitectura

### Estructura de Módulos

```
backend/
├── app/
│   ├── main.py           # API FastAPI
│   ├── models.py         # Pydantic Models (validación)
│   └── utils.py          # Lógica de negocio
│       ├── DataProcessor
│       ├── RegressionFitter
│       └── Simulator
```

### Flujo de Datos

```
1. Cliente carga CSV
              ↓
2. POST /upload
      ↓
3. DataProcessor.load_data()
      - Valida columnas
      - Convierte tipos
      - Interpola NaNs
      - Ordena por fecha
              ↓
4. Datos listos para regresión (estado global)
              ↓
5. POST /fit
      ↓
6. RegressionFitter.fit()
      - Agrupa X, y
      - Ajusta OLS/Ridge
      - Calcula VIF
      - Bootstrap CI
              ↓
7. Resultados almacenados (estado global)
              ↓
8. POST /simulate
      ↓
9. Simulator.simulate()
      - Crea escenarios
      - Predice impact
      - Calcula delta
              ↓
10. Predicción retornada al cliente
```

### Clases Principales

#### DataProcessor
```python
class DataProcessor:
    - load_data(df, cols)      # Carga y valida
    - _preprocess_data(df)     # Limpia datos
    - get_regression_data()    # Retorna X, y
    - get_dates()              # Retorna fechas
    - get_feature_names()      # Retorna feature names
```

**Validaciones:**
- Mínimo 10 observaciones
- Todas las columnas existen
- Fechas válidas
- Valores numéricos

**Preprocesamiento:**
- Conversión a numérico
- Interpolación lineal de NaNs
- Relleno con media si persisten NaNs

#### RegressionFitter
```python
class RegressionFitter:
    - fit(regularization, alpha, bootstrap)  # Ajusta modelo
    - _calculate_vif(X, names)   # Detección multicolinealidad
    - _bootstrap_ci(X, y, n)     # Intervalos confianza
    - _get_results()             # Formatea salida
```

**Lógica:**
1. Agrega constante a X
2. Ajusta OLS con Statsmodels
3. Calcula VIF para cada variable
4. Realiza bootstrap para CI
5. Retorna resultado formateado

#### Simulator
```python
class Simulator:
    - simulate(changes)  # Simula escenarios
```

**Lógica:**
1. Calcula predicción base (X_mean)
2. Aplica cambios porcentuales (X_scenario)
3. Predice nuevo valor
4. Calcula delta (diferencia absoluta y %)

### Endpoints REST

#### POST /upload
```
Input: 
  - file: CSV
  - date_column: str
  - target_column: str
  - feature_columns: str (comma-separated)
  - control_columns: str (comma-separated, optional)

State Update:
  - processor.data = DataFrame procesado
  - processor.date_column = ...
  - processor.target_column = ...
  - processor.feature_columns = ...
  - processor.control_columns = ...

Output:
  {
    "status": "success",
    "shape": [n_obs, n_cols],
    "date_range": "2024-01-01 to 2024-12-01"
  }
```

#### POST /fit
```
Input:
  {
    "regularization": "none" | "ridge" | null,
    "alpha": float,
    "bootstrap_samples": int
  }

State Update:
  - fitter.model = fitted model
  - fitter.residuals = residuals
  - fitter.vif_values = dict
  - simulator = Simulator instance

Output:
  {
    "status": "success",
    "r_squared": float,
    "coefficients": {...},
    "p_values": {...},
    "vif_values": {...},
    "residuals": [...],
    "fitted_values": [...],
    "bootstrap_ci": {...}
  }
```

#### POST /simulate
```
Input:
  {
    "changes": {
      "Channel_A": 10,
      "Channel_B": -5
    }
  }

Output:
  {
    "status": "success",
    "baseline_prediction": float,
    "scenario_prediction": float,
    "delta": float,
    "delta_percentage": float
  }
```

### Estado en memoria y límites operativos

El backend utiliza `app.state` (FastAPI application state) para mantener en memoria el último `DataProcessor` cargado y el último `RegressionFitter`/`Simulator` ajustado. Esto facilita un flujo interactivo en sesiones de desarrollo y demo, pero implica las siguientes consideraciones:

- `app.state` es volátil y compartido por la instancia de la aplicación; en entornos con múltiples procesos o instancias (por ejemplo, detrás de un load balancer) el estado no es consistente entre réplicas.
- Actualmente el servicio aplica límites operativos para proteger recursos:
        - Tamaño máximo de archivo CSV aceptado en `/upload`: **5 MB** (5_000_000 bytes). Peticiones que excedan este límite retornan HTTP 413.
        - Límite máximo de muestras bootstrap en `/fit`: **5000**. Valores mayores serán rechazados o recortados por el servidor.

Recomendaciones para producción:

- Persistir datasets y modelos en un almacenamiento compartido (base de datos, S3, o Redis) en lugar de `app.state`.
- Convertir procesos pesados (bootstrap, re-ajustes con muchas réplicas) a tareas en background usando una cola (Celery, RQ) y workers dedicados.
- Añadir autenticación/autorización y scoping por usuario/organización para evitar que un usuario vea o sobrescriba el estado de otro.
- Monitorizar uso de memoria y tiempo de CPU, y exponer métricas (Prometheus) para alertas.

Estas notas están alineadas con las validaciones en el frontend (mensajes sobre tamaño máximo y límite bootstrap) y la documentación de instalación.

## Frontend - Arquitectura

### Componentes React

```
App (Estado global)
├── DataUpload
│   └── Carga CSV y mapeo de columnas
├── ModelFit
│   └── Configuración de regularización
├── RegressionResults
│   ├── Métrica Cards (R², AIC, BIC, etc.)
│   ├── Tabla de Coeficientes
│   ├── Gráfico de Coeficientes (Bar)
│   ├── Gráfico VIF (Bar + Warning)
│   └── Análisis de Residuos (Scatter)
└── ScenarioSimulator
    ├── Inputs de cambios (sliders)
    ├── Cards de resultados
    ├── Tabla de cambios
    └── Insights
```

### Estado de la Aplicación

```typescript
interface AppState {
  dataLoaded: boolean,
  regressionResults: RegressionData | null,
  activeTab: "upload" | "fit" | "results" | "simulate"
}
```

### Flujo de Interacción

```
1. Usuario sube CSV
        ↓
2. DataUpload.handleSubmit()
        ↓
3. api.uploadData() [POST /upload]
        ↓
4. setDataLoaded(true)
        ↓
5. Switch a tab "fit"
        ↓
6. Usuario configura regresión
        ↓
7. ModelFit.handleSubmit()
        ↓
8. api.fitModel() [POST /fit]
        ↓
9. setRegressionResults(data)
        ↓
10. Mostrar RegressionResults
        ↓
11. Usuario modifica escenario
        ↓
12. ScenarioSimulator.handleSimulate()
        ↓
13. api.simulateScenario() [POST /simulate]
        ↓
14. setResult(data)
        ↓
15. Mostrar resultados de simulación
```

### Componente DataUpload

```
A. Input de archivo
B. Input de columnas (date, target, features, control)
C. Submit button → POST /upload
D. Tabla de ejemplo del formato esperado
```

Validaciones en cliente:
- Archivo no vacío
- Campos requeridos llenos
- Columnas separadas por comas

### Componente ModelFit

```
A. Select de regularización (OLS/Ridge)
B. Input numérico para Alpha (condicional si Ridge)
C. Input numérico para Bootstrap samples
D. Submit button → POST /fit
E. Info panel sobre regularización
```

### Componente RegressionResults

```
A. Grid de métricas (R², R² adj, F-stat, AIC, BIC)
B. Tabla de coeficientes con p-values y significancia
C. Gráfico de barras de coeficientes
D. Gráfico de barras de VIF (con warning si > 10)
E. Gráfico scatter de residuos vs fitted values
F. Estadísticas de residuos (media, std)
```

Visualizaciones:
- **Recharts**: Librería de gráficos
- **Responsive**: Se adapta a pantalla
- **Interactivo**: Tooltips al pasar el mouse

### Componente ScenarioSimulator

```
A. Inputs por feature (numérico + slider -100% a +100%)
B. Botones: Simular | Restablecer
C. (Si resultado):
   - Cards de resultados (baseline, scenario, delta)
   - Tabla de cambios aplicados
   - Insights automáticos
```

## Modelos de Datos

### Pydantic Models (Backend)

```python
class ColumnMapping(BaseModel):
    date_column: str
    target_column: str
    feature_columns: List[str]
    control_columns: Optional[List[str]]

class FitRequest(BaseModel):
    regularization: Optional[str]
    alpha: Optional[float]
    bootstrap_samples: Optional[int]

class RegressionResults(BaseModel):
    coefficients: Dict[str, float]
    p_values: Dict[str, float]
    r_squared: float
    adjusted_r_squared: float
    vif_values: Optional[Dict[str, float]]
    residuals: List[float]
    fitted_values: List[float]
    # ... más campos

class SimulationResult(BaseModel):
    baseline_prediction: float
    scenario_prediction: float
    delta: float
    delta_percentage: float
    changes_applied: Dict[str, float]
```

## Technologías Clave

### Backend
| Componente | Librería | Uso |
|-----------|----------|-----|
| API Web | FastAPI | Endpoints REST |
| Servidor | Uvicorn | ASGI server |
| Datos | Pandas | Manipulación CSV |
| Estadística | Statsmodels | OLS regression |
| Regularización | Scikit-learn | Ridge, scaling |
| Numérico | NumPy, SciPy | Computación |
| Validación | Pydantic | Schemas JSON |

### Frontend
| Componente | Librería | Uso |
|-----------|----------|-----|
| Framework UI | React | Componentes |
| Bundler | Vite | Build + dev server |
| HTTP Client | Axios | Llamadas API |
| Gráficos | Recharts | Visualizaciones |
| Notificaciones | React Hot Toast | Toast messages |
| Tipado | TypeScript | Type safety |

## Flujo de Regresión en Detalle

### 1. OLS (Ordinary Least Squares)

Minimiza:
$$SS_{res} = \sum_{i=1}^{n} (y_i - \hat{y}_i)^2$$

Donde $\hat{y}_i = \beta_0 + \beta_1 x_{i1} + ... + \beta_p x_{ip}$

**Uso:** Cuando no hay multicolinealidad

### 2. Ridge Regression (L2)

Minimiza:
$$SS_{res} + \alpha \sum_{j=1}^{p} \beta_j^2$$

**Uso:** Cuando VIF > 10 (multicolinealidad)

### 3. Bootstrap para CI

Para cada coeficiente $\beta_j$:
1. Remuestrear (X, y) con reemplazo, m veces
2. Ajustar OLS en cada muestra
3. CI = [percentil 2.5%, percentil 97.5%]

## Testing

```
tests/test_backend.py
├── TestDataProcessor
│   ├── test_load_data_success
│   ├── test_insufficient_observations
│   ├── test_missing_columns
│   ├── test_nan_handling
│   └── test_get_regression_data
└── TestRegressionFitter
    ├── test_fit_ols
    ├── test_coefficients_shape
    ├── test_r_squared_reasonable
    ├── test_vif_values_present
    ├── test_residuals_shape
    └── test_bootstrap_ci
```

## Seguridad y Validación

### En DataProcessor
- ✅ Validar número de observaciones
- ✅ Validar que columnas existen
- ✅ Validar tipos numéricos
- ✅ Detectar y interpolar NaNs
- ✅ Ordenar por fecha

### En RegressionFitter
- ✅ Validar X es matriz numérica
- ✅ Validar y es vector numérico
- ✅ Detectar multicolinealidad (VIF)
- ✅ Validar modelo converge

### En Frontend
- ✅ Validar archivo es CSV
- ✅ Validar campos no vacíos
- ✅ Manejo de errores HTTP
- ✅ CORS headers validados

## Consideraciones de Escalabilidad

**Limitaciones actuales:**
- Estado almacenado en memoria (no persistente)
- Una sesión a la vez (no multi-usuario)
- CSV limitado a tamaño memoria

**Para producción considerar:**
- Base de datos (PostgreSQL, MongoDB)
- Caché (Redis)
- Autenticación (JWT)
- Rate limiting
- Logging centralizado
- Monitoreo

---

**Documento de Arquitectura - Última actualización: 2024**

# 📊 Marketing Attribution Calculator - MVP

Una calculadora web moderna para atribución de marketing basada en **regresión lineal múltiple**. Permite cargar datos de marketing, ajustar modelos de regresión, analizar coeficientes y simular escenarios.

## 🎯 Características

### Análisis de Regresión
- ✅ **Regresión Lineal Múltiple (OLS)** con coeficientes e intervalos de confianza
- ✅ **Ridge Regression (L2)** para manejar multicolinealidad
- ✅ **Bootstrap** para calcular intervalos de confianza (95%)
- ✅ **Validación de datos** (mínimo 10 observaciones, manejo de NaNs)
- ✅ **Detección de multicolinealidad** (VIF - Variance Inflation Factor)

### Visualizaciones Interactivas
- 📈 Gráfico de coeficientes de regresión
- 📊 Gráfico VIF (detección de multicolinealidad)
- 🔵 Plot de residuos vs valores ajustados
- 📉 Métricas del modelo (R², AIC, BIC, F-estadístico)

### Simulador de Escenarios
- 🎮 Modifica gastos por canal (porcentaje)
- 🎯 Visualiza impacto predicho en la variable objetivo
- 📊 Compara escenarios (baseline vs. modified)
- 💡 Análisis de sensibilidad automático

### API REST
- `POST /upload` - Carga archivo CSV y mapea columnas
- `POST /fit` - Ajusta modelo de regresión lineal
- `POST /simulate` - Simula escenarios de cambios
- `GET /status` - Estado de los datos cargados

## 🚀 Inicio Rápido

### Prerequisitos
- Python 3.9+
- Node.js 16+
- npm o yarn
Nota: Asegúrate de que Python esté disponible en PATH en Windows. Si no se encuentra el comando `python`, utiliza la ruta completa o instala Python 3.9+ y habilita "Agregar a PATH".

### Instalación

1. **Clonar el repositorio**
```bash
cd CalculadoraWeb
```

2. **Backend - FastAPI**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Frontend - React + Vite**
```bash
cd frontend
npm install
```

### Ejecutar la Aplicación

#### Terminal 1 - Backend
```bash
cd backend
source venv/bin/activate  # En Windows: venv\Scripts\activate
python -m uvicorn app.main:app --reload
```
Backend disponible en: `http://localhost:8000`
Documentación Swagger: `http://localhost:8000/docs`

Nota importante de seguridad y límites
- Tamaño máximo de upload: 5 MB (el endpoint `POST /upload` devolverá 413 si supera este límite).
- Parámetro `bootstrap_samples` tiene un máximo práctico de 5000 para evitar uso excesivo de CPU/memoria; se valida en el backend.
- CORS: el backend permite orígenes de desarrollo (`http://localhost:5173`, `http://localhost:3000`) — la configuración no usa `*` cuando `allow_credentials=True`.

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
Frontend disponible en: `http://localhost:5173`

## 📝 Uso

### 1. Generar Dataset de Ejemplo

```bash
cd data
python generate_example_data.py
```
Esto crea `example_data.csv` con:
- 12 meses de datos
- 3 canales de marketing (Channel_A, B, C)
- Variable de control (Seasonality Index)
- Variable objetivo (Conversions)

### 2. Cargar Datos en la Interfaz

1. Accede a http://localhost:5173
2. Ve a la pestaña "1. Cargar Datos"
3. Sube `example_data.csv`
4. Mapea las columnas:
   - **Fecha**: `Date`
   - **Objetivo**: `Conversions`
   - **Features**: `Channel_A_Spend, Channel_B_Spend, Channel_C_Spend`
   - **Control**: `Seasonality_Index`

### 3. Ajustar Modelo

1. Ve a "2. Ajustar Modelo"
2. Selecciona opciones:
   - Regularización: `Sin regularización (OLS)` o `Ridge (L2)`
   - Alpha (si es Ridge): 1.0
   - Muestras Bootstrap: 1000
3. Haz clic en "Ajustar Modelo"

### 4. Analizar Resultados

1. Ve a "3. Resultados"
2. Observa:
   - Métricas clave (R², R² ajustado, F-estadístico)
   - **Coeficientes** e **p-values** (significancia)
   - **VIF** para multicolinealidad (> 10 = problema)
   - **Residuos** (distribución de errores)

### 5. Simular Escenarios

1. Ve a "4. Simulación"
2. Modifica gastos por canal (% de cambio)
3. Usa sliders o ingresa valores directamente
4. Visualiza impacto predicho:
   - Predicción base (escenario actual)
   - Predicción después de cambios
   - **Delta** (cambio absoluto y %)

## 📊 Ejemplo de Dataset

| Date       | Channel_A_Spend | Channel_B_Spend | Channel_C_Spend | Conversions | Seasonality_Index |
|------------|-----------------|-----------------|-----------------|-------------|-------------------|
| 2024-01-01 | 5000.00        | 3000.00        | 2000.00        | 1200        | 0.00             |
| 2024-02-01 | 5200.50        | 3100.25        | 1975.00        | 1350        | 58.78            |
| 2024-03-01 | 5388.27        | 3206.35        | 1950.00        | 1420        | 95.11            |
| ...        | ...             | ...             | ...             | ...         | ...              |

## 🧪 Tests Unitarios

```bash
cd tests
pytest test_backend.py -v

# Con cobertura
pytest test_backend.py --cov=backend/app
```

**Tests incluidos:**
- ✅ Carga de datos (validación, mínimo observaciones)
- ✅ Manejo de NaNs e interpolación
- ✅ Detección de columnas faltantes
- ✅ Ajuste OLS y métricas
- ✅ Cálculo de VIF
- ✅ Bootstrap para intervalos de confianza

## 🔧 Endpoints API

### POST /upload
Carga CSV y mapea columnas.

**Request:**
```bash
curl -X POST "http://localhost:8000/upload" \
  -F "file=@example_data.csv" \
  -F "date_column=Date" \
  -F "target_column=Conversions" \
  -F "feature_columns=Channel_A_Spend,Channel_B_Spend,Channel_C_Spend" \
  -F "control_columns=Seasonality_Index"
```

**Response:**
```json
{
  "status": "success",
  "message": "Datos cargados: 12 observaciones",
  "shape": [12, 5],
  "date_range": "2024-01-01 00:00:00 to 2024-12-01 00:00:00"
}
```

### POST /fit
Ajusta modelo de regresión.

**Request:**
```json
{
  "regularization": null,
  "alpha": 1.0,
  "bootstrap_samples": 1000
}
```

**Response:**
```json
{
  "status": "success",
  "r_squared": 0.8954,
  "adjusted_r_squared": 0.8603,
  "coefficients": {
    "const": 500.123,
    "Channel_A_Spend": 0.15,
    "Channel_B_Spend": 0.25,
    "Channel_C_Spend": 0.10
  },
  "p_values": {
    "const": 0.001,
    "Channel_A_Spend": 0.045,
    "Channel_B_Spend": 0.012,
    "Channel_C_Spend": 0.089
  },
  "vif_values": {
    "Channel_A_Spend": 2.5,
    "Channel_B_Spend": 1.8,
    "Channel_C_Spend": 2.1
  },
  "observations": 12,
  "f_statistic": 24.56,
  "f_pvalue": 0.0001
}
```

### POST /simulate
Simula escenario con cambios porcentuales.

**Request:**
```json
{
  "changes": {
    "Channel_A_Spend": 10,
    "Channel_B_Spend": -5
  }
}
```

**Response:**
```json
{
  "status": "success",
  "baseline_prediction": 1250.5,
  "scenario_prediction": 1310.2,
  "delta": 59.7,
  "delta_percentage": 4.77,
  "changes_applied": {
    "Channel_A_Spend": 10,
    "Channel_B_Spend": -5
  }
}
```

## 📚 Interpretación de Resultados

### R² (Coeficiente de Determinación)
- **0.8-1.0**: Excelente ajuste
- **0.6-0.8**: Buen ajuste
- **0.4-0.6**: Ajuste moderado
- **< 0.4**: Ajuste pobre

### P-values
- **< 0.05**: Variable significativa (confianza 95%)
- **>= 0.05**: Variable no significativa

### VIF (Variance Inflation Factor)
- **VIF < 5**: Multicolinealidad baja (ideal)
- **5 <= VIF <= 10**: Multicolinealidad moderada
- **VIF > 10**: Multicolinealidad alta (considerar Ridge o eliminar)

### Residuos
- **Media ≈ 0**: El modelo no tiene sesgo
- **Distribución normal**: Cumple supuestos de regresión
- **Homocedasticidad**: Varianza constante (sin patrón)

## 🏗️ Estructura del Proyecto

```
CalculadoraWeb/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # API FastAPI
│   │   ├── models.py        # Modelos Pydantic
│   │   └── utils.py         # Lógica de regresión
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts    # Cliente HTTP
│   │   ├── components/
│   │   │   ├── DataUpload.tsx
│   │   │   ├── ModelFit.tsx
│   │   │   ├── RegressionResults.tsx
│   │   │   └── ScenarioSimulator.tsx
│   │   ├── App.tsx          # Componente principal
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── index.html
├── tests/
│   └── test_backend.py      # Tests unitarios
├── data/
│   ├── generate_example_data.py
│   └── example_data.csv     (generado)
├── .gitignore
└── README.md
```

## 📦 Dependencias Principales

### Backend
- **FastAPI**: Framework API web moderno
- **pandas**: Procesamiento de datos
- **statsmodels**: Modelos estadísticos (OLS, VIF)
- **scikit-learn**: Machine learning (Ridge, escalado)
- **numpy/scipy**: Computación científica

### Frontend
- **React**: Framework UI
- **Vite**: Bundler moderno y rápido
- **Axios**: Cliente HTTP
- **Recharts**: Gráficos interactivos
- **react-hot-toast**: Notificaciones

## 🤝 Contribuciones

Para contribuir:
1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Haz commits descriptivos (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Notas Técnicas

### Supuestos de Regresión Lineal
1. **Linealidad**: Relación lineal entre X e y
2. **Independencia**: Observaciones independientes
3. **Normalidad**: Residuos distribuidos normalmente
4. **Homocedasticidad**: Varianza constante de errores
5. **Sin multicolinealidad**: Variables independientes entre sí

### Regularización Ridge
$J(\beta) = \frac{1}{2m} \sum_{i=1}^{m}(h_\beta(x^{(i)}) - y^{(i)})^2 + \frac{\alpha}{2m} \sum_{j=1}^{n} \beta_j^2$

Donde α es el parámetro de regularización (lambda).

### Bootstrap para Intervalos de Confianza
1. Remuestrear datos con reemplazo (n=1000)
2. Ajustar modelo en cada muestra
3. Calcular percentiles 2.5% y 97.5% de los coeficientes

## 🐛 Troubleshooting

### Error "CORS policy"
→ Asegúrate que backend corre en `http://localhost:8000`
 - Verifica que `allow_origins` en `backend/app/main.py` incluye el origen del frontend. Por seguridad la configuración no usa `*` cuando `allow_credentials=True`.
 - Si ves errores 403/blocked CORS, revisa la consola del navegador para el origen exacto y añádelo a `allow_origins`.
### Error "Datos no cargados"
→ Completa primero la pestaña "1. Cargar Datos"

### Error "Columna no encontrada"
→ Verifica que los nombres de columnas coincidan exactamente (case-sensitive)

### NaNs en los datos
→ Se interpolan automáticamente con interpolación lineal

## 📄 Licencia

Este proyecto está bajo licencia MIT.

## 🎯 Roadmap Futuro

- [ ] Exportar resultados (PDF, Excel)
- [ ] Más tipos de regularización (Lasso, ElasticNet)
- [ ] Detección automática de outliers
- [ ] Predicción de series temporales
- [ ] Dashboard interactivo avanzado
- [ ] Autenticación de usuarios
- [ ] Histórico de análisis

---

**Desarrollado con ❤️ para análisis de marketing basado en datos**

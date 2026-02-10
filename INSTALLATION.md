# 🚀 Guía de Instalación - Marketing Attribution Calculator MVP

## Requisitos del Sistema

- **Python 3.9+** ([Descargar](https://www.python.org/downloads/))
- **Node.js 16+** ([Descargar](https://nodejs.org/))
- **Git** ([Descargar](https://git-scm.com/))
- **pip** (incluido con Python)
- **npm o yarn** (incluido con Node.js)

## Instalación Detallada

### Paso 1: Clonar o Descargar el Repositorio

```bash
# Si ya tienes el código, navega a la carpeta
cd CalculadoraWeb
```

### Paso 2: Instalar Backend

#### 2.1 Crear Entorno Virtual

```bash
cd backend

# En Windows
python -m venv venv
venv\Scripts\activate

# En macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### 2.2 Instalar Dependencias

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Paquetes que se instalarán:**
- FastAPI 0.104.1
- Uvicorn 0.24.0
- Pandas 2.1.3
- NumPy 1.26.2
- Statsmodels 0.14.0
- Scikit-learn 1.3.2
- Y más...

#### 2.3 Verificar Instalación

```bash
python -c "import fastapi; import statsmodels; print('Backend dependencies OK ✓')"
```

### Paso 3: Instalar Frontend

#### 3.1 Navegar a Carpeta Frontend

```bash
cd frontend  # Desde la raíz del proyecto
```

#### 3.2 Instalar Dependencias

```bash
npm install
# O si usas yarn:
yarn install
```

**Paquetes que se instalarán:**
- React 18.2.0
- Vite 5.0.2
- Axios 1.6.2
- Recharts 2.10.3
- Y más...

### Paso 4: Generar Dataset de Ejemplo

```bash
cd data

# Opción 1: Usar el script Python (si tienes Python instalado)
python generate_example_data.py

# Opción 2: El archivo example_data.csv ya está incluido
```

El archivo `example_data.csv` contiene:
- 12 meses de datos (2024)
- 3 canales de marketing
- Variable de control (Seasonality)
- Variable objetivo (Conversions)

## Ejecución

### Terminal 1: Backend FastAPI

```bash
cd backend

# Activar entorno virtual
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate      # Windows

# Iniciar servidor
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Output esperado:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

Con `--reload`, el servidor se reinicia automáticamente cuando cambias código.

**APIs disponibles:**
- Documentación Swagger: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Límites y validaciones del servidor

- Tamaño máximo de archivo CSV aceptado por el endpoint `/upload`: **5 MB** (5_000_000 bytes). Si envías un archivo mayor, el servidor responde con HTTP 413 (Payload Too Large).
- Límite máximo de muestras bootstrap aceptadas por el endpoint `/fit`: **5000**. Peticiones con valores mayores serán rechazadas o automáticamente limitadas por el servidor por razones de seguridad y uso de recursos.
- El backend mantiene en memoria el último dataset cargado y el último modelo ajustado en `app.state`. Para entornos multiusuario o producción se recomienda persistencia (DB/Redis) y colas de trabajo para operaciones pesadas.

Incluye validaciones cliente en el frontend para avisar al usuario sobre estos límites antes de enviar la petición.

### Terminal 2: Frontend React + Vite

```bash
cd frontend

# Instalar dependencias si aún no las has instalado
npm install

# Iniciar servidor de desarrollo
npm run dev
```

**Output esperado:**
```
VITE v5.0.2  ready in 123 ms

➜  Local:   http://localhost:5173/
```

La aplicación se abrirá automáticamente en el navegador.

## Uso de la Aplicación

### Flujo Completo

1. **Pestaña 1 - Cargar Datos:**
   - Sube `data/example_data.csv`
   - Mapea columnas:
     - Fecha: `Date`
     - Objetivo: `Conversions`
     - Features: `Channel_A_Spend, Channel_B_Spend, Channel_C_Spend`
     - Control: `Seasonality_Index`
   - Haz clic en "Cargar Datos"

2. **Pestaña 2 - Ajustar Modelo:**
   - Elige "Sin regularización (OLS)" para empezar
   - Bootstrap: 1000 muestras (por defecto)
   - Haz clic en "Ajustar Modelo"

3. **Pestaña 3 - Resultados:**
   - Analiza R², coeficientes, p-values
   - Revisa VIF (advertencia si > 10)
   - Observa residuos

4. **Pestaña 4 - Simulación:**
   - Modifica gastos por canal (%)
   - Usa sliders o campos numéricos
   - Visualiza impacto predicho

## Troubleshooting

### Error: "No module named 'fastapi'"
```bash
# Asegúrate que el entorno virtual está activado
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate      # Windows

# Reinstala dependencias
pip install -r requirements.txt
```

### Error: "CORS policy: Access to XMLHttpRequest"
```bash
# Verifica que backend corre en puerto 8000
# Verifica que frontend corre en puerto 5173
# Reinicia ambos servidores
```

### Error: "npm not found"
```bash
# Instala Node.js desde https://nodejs.org/
# Recarga tu terminal después de instalar
node --version  # Debería mostrar v16+
npm --version   # Debería mostrar 8+
```

### Error: "Python not found"
```bash
# Asegúrate que Python está en el PATH
python --version  # Debería mostrar Python 3.9+

# En Windows, durante instalación marca "Add to PATH"
```

## Tests Unitarios

```bash
cd tests

# Ejecutar todos los tests
pytest test_backend.py -v

# Ejecutar con cobertura
pytest test_backend.py --cov=../backend/app --cov-report=html

# Tests específicos
pytest test_backend.py::TestDataProcessor -v
pytest test_backend.py::TestRegressionFitter -v
```

## Detener los Servidores

Presiona `Ctrl + C` en cada terminal para detener los servidores.

## Estructura de Carpetas

```
CalculadoraWeb/
├── backend/
│   ├── app/
│   │   ├── main.py       ← Endpoints API
│   │   ├── models.py     ← Validación datos
│   │   └── utils.py      ← Lógica regresión
│   ├── venv/             ← Entorno virtual (creado)
│   └── requirements.txt   ← Dependencias
├── frontend/
│   ├── src/
│   │   ├── components/   ← Componentes React
│   │   ├── api/          ← Cliente HTTP
│   │   └── App.tsx       ← App principal
│   ├── node_modules/     ← Dependencias (creado)
│   └── package.json
├── tests/
│   └── test_backend.py   ← Tests unitarios
├── data/
│   └── example_data.csv  ← Dataset de prueba
└── README.md             ← Documentación
```

## Próximos Pasos

1. Experimenta con diferentes ajustes de regularización (Ridge)
2. Prueba diferentes datasets
3. Explora la documentación en http://localhost:8000/docs
4. Modifica los parámetros en el simulador de escenarios

## Contacto y Soporte

Para reportar issues o sugerencias, contacta al equipo de desarrollo.

---

**¡Listo! Ya tienes el MVP de calculadora de atribución marketing funcionando completamente.** 🎉

# ⚡ Quick Start - Marketing Attribution Calculator

## 🚀 5 Minutos para Empezar

### Opción 1: Scripts Automáticos (Recomendado)

#### Windows (PowerShell):
```powershell
# Backend
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload

# En otra terminal
cd frontend
npm install
npm run dev
```

#### macOS/Linux (Bash):
```bash
# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload

# En otra terminal
cd frontend
npm install
npm run dev
```

### Opción 2: Docker (Si tienes Docker)

```bash
# Próximamente: Dockerfile disponible
```

---

## ✅ Verificar que Todo Funciona

1. Backend running: http://localhost:8000
2. Frontend running: http://localhost:5173
3. Docs del backend: http://localhost:8000/docs

---

## 📊 Usar la App (3 Clics)

1. **Carga datos:** Sube `data/example_data.csv`
   - Fecha: `Date`
   - Objetivo: `Conversions`
   - Features: `Channel_A_Spend, Channel_B_Spend, Channel_C_Spend`

2. **Ajusta modelo:** Clica "Ajustar Modelo"

3. **Simula:** Modifica gastos y visualiza impacto

---

## 📁 Archivos Clave

- Backend API: `backend/app/main.py`
- Frontend Principal: `frontend/src/App.tsx`
- Datos Ejemplo: `data/example_data.csv`
- Tests: `tests/test_backend.py`

---

## 🆘 Si Algo Falla

| Problema | Solución |
|----------|----------|
| "No module named fastapi" | `pip install -r requirements.txt` |
| CORS error | Reinicia ambos servidores |
| npm not found | Instala Node.js de nodejs.org |
| Puerto 8000 en uso | Cambia: `--port 8001` |
| Puerto 5173 en uso | Cambia en vite.config.ts |

---

## 💡 Próximos Pasos

- [ ] Ejecutar tests: `pytest tests/test_backend.py -v`
- [ ] Cargar tus propios datos
- [ ] Explorar documentación: `http://localhost:8000/docs`
- [ ] Leer INSTALLATION.md para detalles

---

**¡Listo! Ya puedes analizar atribución de marketing.** 🎉

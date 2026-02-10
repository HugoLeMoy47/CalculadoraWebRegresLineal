import toast from 'react-hot-toast'

interface ErrorTip {
  title: string
  message: string
  tips: string[]
}

const ERROR_TIPS: Record<string, ErrorTip> = {
  'file_required': {
    title: 'Archivo requerido',
    message: 'Por favor selecciona un archivo CSV',
    tips: [
      'Asegúrate de elegir un archivo con extensión .csv',
      'El archivo debe contener al menos los datos de ejemplo mostrados',
      'Verifica que el archivo no esté vacío',
    ],
  },
  'file_too_large': {
    title: 'Archivo demasiado grande',
    message: 'El archivo excede el límite de 5 MB',
    tips: [
      'Comprime o divide tu archivo en partes más pequeñas',
      'Reduce el número de filas si es posible',
      'Verifica que la codificación del archivo sea UTF-8',
    ],
  },
  'required_fields': {
    title: 'Campos requeridos incompletos',
    message: 'Por favor completa todos los campos marcados como obligatorios',
    tips: [
      'Especifica la columna de fecha (Date)',
      'Indica la columna objetivo (Target)',
      'Proporciona al menos una columna de feature',
      'Los nombres de columnas deben coincidir exactamente con las de tu CSV',
    ],
  },
  'column_not_found': {
    title: 'Columna no encontrada',
    message: 'Una o más columnas especificadas no existen en el archivo',
    tips: [
      'Verifica que los nombres de columnas sean exactos (mayúsculas y espacios)',
      'Usa el nombre exacto de la columna tal como aparece en el CSV',
      'Evita caracteres especiales o espacios adicionales',
    ],
  },
  'invalid_data': {
    title: 'Datos inválidos',
    message: 'El archivo contiene datos que no pueden procesarse',
    tips: [
      'Asegúrate de que las columnas numéricas contienen solo números',
      'Verifica que la columna de fecha tenga formato válido (YYYY-MM-DD)',
      'Revisa que no haya celdas vacías en las columnas requeridas',
    ],
  },
  'min_observations': {
    title: 'Datos insuficientes',
    message: 'El archivo debe contener al menos 10 observaciones',
    tips: [
      'Aumenta el número de filas en tu archivo CSV',
      'Combina múltiples archivos si es necesario',
      'Una regresión lineal requiere suficientes datos para ser significativa',
    ],
  },
  'bootstrap_too_high': {
    title: 'Valor de Bootstrap demasiado alto',
    message: 'El número máximo de muestras bootstrap es 5000',
    tips: [
      'Reduce el número de muestras a un valor entre 100 y 5000',
      'Valores típicos: 1000-2000 para un buen balance',
      'Más muestras = más precisión pero más tiempo de procesamiento',
    ],
  },
  'no_changes': {
    title: 'Sin cambios especificados',
    message: 'Por favor especifica al menos un cambio de escenario',
    tips: [
      'Ajusta el deslizador o ingresa un valor en al menos un campo',
      'Los cambios pueden ser positivos (aumento) o negativos (disminución)',
      'Los valores se interpretan como cambios porcentuales',
    ],
  },
  'network_error': {
    title: 'Error de conexión',
    message: 'No se pudo conectar con el servidor',
    tips: [
      'Verifica que el servidor backend esté ejecutándose',
      'Comprueba tu conexión a internet',
      'Intenta recargar la página',
      'Si el problema persiste, contacta al administrador',
    ],
  },
  'server_error': {
    title: 'Error en el servidor',
    message: 'El servidor encontró un problema procesando tu solicitud',
    tips: [
      'Verifica los datos de entrada y vuelve a intentar',
      'Si el problema persiste, intenta con un archivo diferente',
      'Revisa la consola del navegador para más detalles',
    ],
  },
}

export function getErrorTips(errorType: string): ErrorTip {
  return (
    ERROR_TIPS[errorType] || {
      title: 'Error',
      message: errorType,
      tips: ['Intenta nuevamente o contacta al administrador'],
    }
  )
}

export function parseErrorFromResponse(error: any): {
  type: string
  message: string
  tips: ErrorTip
} {
  const detail = error.response?.data?.detail || error.message || 'Error desconocido'

  // Mapear mensajes de error comunes del backend a tipos conocidos
  let errorType = 'server_error'

  if (detail.includes('No file') || detail.includes('archivo')) {
    errorType = 'file_required'
  } else if (detail.includes('File too large') || detail.includes('demasiado grande')) {
    errorType = 'file_too_large'
  } else if (
    detail.includes('Column') ||
    detail.includes('columna') ||
    detail.includes('not found')
  ) {
    errorType = 'column_not_found'
  } else if (
    detail.includes('observations') ||
    detail.includes('observaciones') ||
    detail.includes('minimum')
  ) {
    errorType = 'min_observations'
  } else if (detail.includes('Bootstrap') || detail.includes('bootstrap')) {
    errorType = 'bootstrap_too_high'
  } else if (detail.includes('required') || detail.includes('requerido')) {
    errorType = 'required_fields'
  } else if (detail.includes('Invalid') || detail.includes('inválido')) {
    errorType = 'invalid_data'
  } else if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
    errorType = 'network_error'
  }

  const tips = getErrorTips(errorType)

  return {
    type: errorType,
    message: detail,
    tips,
  }
}

export function showErrorWithTips(error: any) {
  const errorInfo = parseErrorFromResponse(error)

  const tipsText = errorInfo.tips.tips
    .map((tip, idx) => `${idx + 1}. ${tip}`)
    .join('\n')

  const fullMessage = `${errorInfo.tips.title}\n${errorInfo.tips.message}\n\n💡 SOLUCIONES:\n${tipsText}`

  toast.error(fullMessage, {
    duration: 6000,
    icon: '⚠️',
    style: {
      whiteSpace: 'pre-wrap',
      fontSize: '0.9rem',
    },
  })
}

export default { getErrorTips, parseErrorFromResponse, showErrorWithTips }

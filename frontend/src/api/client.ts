import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
})

export const uploadData = async (
  file: File,
  dateColumn: string,
  targetColumn: string,
  featureColumns: string[],
  controlColumns?: string[]
) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('date_column', dateColumn)
  formData.append('target_column', targetColumn)
  formData.append('feature_columns', featureColumns.join(','))
  if (controlColumns && controlColumns.length > 0) {
    formData.append('control_columns', controlColumns.join(','))
  }

  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const fitModel = async (
  regularization?: string,
  alpha?: number,
  bootstrapSamples?: number
) => {
  return api.post('/fit', {
    regularization,
    alpha,
    bootstrap_samples: bootstrapSamples,
  })
}

export const simulateScenario = async (changes: Record<string, number>) => {
  return api.post('/simulate', {
    changes,
  })
}

export const getStatus = async () => {
  return api.get('/status')
}

export const getMetrics = async () => {
  return api.get('/metrics')
}

export default api

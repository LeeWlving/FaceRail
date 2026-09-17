import axios from 'axios'
import i18n from '@/i18n'

const t = (...args) => i18n.global.t(...args)

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 60_000,
})

client.interceptors.response.use(
  (response) => {
    const payload = response.data
    if (payload?.code !== 0) {
      const error = new Error(payload?.message || t('errors.request'))
      ElMessage.error(error.message)
      return Promise.reject(error)
    }
    return payload.data
  },
  (error) => {
    const message = error.response?.data?.message || error.message || t('errors.network')
    ElMessage.error(message)
    return Promise.reject(error)
  },
)

export default client

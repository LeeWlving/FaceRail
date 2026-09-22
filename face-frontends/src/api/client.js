
import { translate } from '@/i18n'

import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 60_000,
})

client.interceptors.response.use(
  (response) => {
    const payload = response.data
    if (payload?.code !== 0) {
      const error = new Error(payload?.message || translate('请求失败'))
      ElMessage.error(error.message)
      return Promise.reject(error)
    }
    return payload.data
  },
  (error) => {
    const message = error.response?.data?.message || error.message || translate('网络连接失败')
    ElMessage.error(message)
    return Promise.reject(error)
  },
)

export default client

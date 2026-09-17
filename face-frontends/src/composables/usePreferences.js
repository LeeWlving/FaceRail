import { ref, watch } from 'vue'
import i18n from '@/i18n'

const locale = ref(i18n.global.locale.value)
const savedMode = localStorage.getItem('facerail.inferenceMode')
const inferenceMode = ref(['device', 'cloud'].includes(savedMode) ? savedMode : 'device')

watch(locale, (value) => {
  i18n.global.locale.value = value
  localStorage.setItem('facerail.locale', value)
  document.documentElement.lang = value
}, { immediate: true })

watch(inferenceMode, (value) => {
  localStorage.setItem('facerail.inferenceMode', value)
})

export function usePreferences() {
  return { locale, inferenceMode }
}

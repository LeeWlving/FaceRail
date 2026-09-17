import i18n from '@/i18n'

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const t = (...args) => i18n.global.t(...args)

export function fileToImagePayload(file) {
  if (!file.type.startsWith('image/')) throw new Error(t('errors.imageFile'))
  if (file.size > MAX_IMAGE_BYTES) throw new Error(t('errors.imageSize'))

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error(t('errors.imageRead')))
    reader.onload = () => {
      const dataUrl = String(reader.result)
      resolve({ dataUrl, base64: dataUrl.split(',')[1] })
    }
    reader.readAsDataURL(file)
  })
}

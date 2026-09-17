const MAX_IMAGE_BYTES = 10 * 1024 * 1024

export function fileToImagePayload(file) {
  if (!file.type.startsWith('image/')) throw new Error('请选择图片文件')
  if (file.size > MAX_IMAGE_BYTES) throw new Error('图片不能超过 10 MB')

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('图片读取失败'))
    reader.onload = () => {
      const dataUrl = String(reader.result)
      resolve({ dataUrl, base64: dataUrl.split(',')[1] })
    }
    reader.readAsDataURL(file)
  })
}

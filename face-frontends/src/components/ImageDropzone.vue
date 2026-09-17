<template>
  <div class="image-dropzone" :class="{ 'image-dropzone--filled': previewUrl }">
    <el-upload
      action=""
      drag
      accept="image/jpeg,image/png,image/webp"
      :show-file-list="false"
      :before-upload="handleFile"
    >
      <img v-if="previewUrl" :src="previewUrl" alt="已选择图片" />
      <div v-else class="dropzone-empty">
        <ImagePlus :size="28" />
        <strong>{{ label }}</strong>
        <span>JPG、PNG 或 WebP，最大 10 MB</span>
      </div>
    </el-upload>
    <el-tooltip v-if="previewUrl" content="移除图片" placement="left">
      <button class="dropzone-remove" type="button" @click.stop="clear">
        <Trash2 :size="16" />
      </button>
    </el-tooltip>
  </div>
</template>

<script setup>
import { ImagePlus, Trash2 } from '@lucide/vue'
import { fileToImagePayload } from '@/utils/image'

defineProps({ label: { type: String, default: '选择查询图片' }, previewUrl: { type: String, default: '' } })
const emit = defineEmits(['update:modelValue', 'update:previewUrl'])

async function handleFile(file) {
  try {
    const payload = await fileToImagePayload(file)
    emit('update:modelValue', payload.base64)
    emit('update:previewUrl', payload.dataUrl)
  } catch (error) {
    ElMessage.error(error.message)
  }
  return false
}

function clear() {
  emit('update:modelValue', '')
  emit('update:previewUrl', '')
}
</script>

<style scoped>
.image-dropzone { position: relative; width: 100%; }
.image-dropzone :deep(.el-upload), .image-dropzone :deep(.el-upload-dragger) { width: 100%; }
.image-dropzone :deep(.el-upload-dragger) { display: grid; min-height: 210px; padding: 0; place-items: center; overflow: hidden; border: 1px dashed #b8c5c0; background: #f7f9f8; }
.image-dropzone :deep(.el-upload-dragger:hover) { border-color: var(--accent); }
.image-dropzone img { display: block; width: 100%; height: 260px; object-fit: contain; background: #edf1ef; }
.dropzone-empty { display: grid; justify-items: center; gap: 8px; color: var(--muted); }
.dropzone-empty svg { color: var(--accent); }
.dropzone-empty strong { color: var(--ink); font-size: 14px; }
.dropzone-empty span { font-size: 11px; }
.dropzone-remove { position: absolute; top: 10px; right: 10px; display: grid; width: 34px; height: 34px; place-items: center; border: 0; border-radius: 6px; color: #ffffff; background: rgb(17 24 22 / 78%); cursor: pointer; }
</style>

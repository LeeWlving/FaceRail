<template>
  <div class="face-thumbnail">
    <el-image
      v-if="src"
      :src="src"
      :alt="$t('人脸图片')"
      fit="cover"
      :preview-src-list="[src]"
      preview-teleported
      hide-on-click-modal
    >
      <template #error><div class="thumbnail-placeholder"><ImageOff :size="18" /></div></template>
    </el-image>
    <el-tooltip v-else :content="$t('暂无图片')" placement="top">
      <div class="thumbnail-placeholder"><ImageOff :size="18" /></div>
    </el-tooltip>
  </div>
</template>

<script setup>
import { ImageOff } from '@lucide/vue'

defineProps({ src: { type: String, default: '' } })
</script>

<style scoped>
.face-thumbnail,
.face-thumbnail :deep(.el-image),
.thumbnail-placeholder {
  width: 48px;
  height: 48px;
}
.face-thumbnail :deep(.el-image) {
  display: block;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: #eef2f0;
  cursor: zoom-in;
}
.thumbnail-placeholder {
  display: grid;
  place-items: center;
  border: 1px dashed var(--border);
  border-radius: 6px;
  color: var(--muted);
  background: #f3f6f4;
}
</style>

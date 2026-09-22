<template>
  <div v-if="imageUrl" class="face-overlay">
    <img :src="imageUrl" :alt="$t('人脸分析图片')" @load="onLoad" />
    <div
      v-for="(box, index) in boxes"
      :key="index"
      class="face-box"
      :style="boxStyle(box)"
    >
      <span v-if="box.label">{{ box.label }}</span>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

defineProps({
  imageUrl: { type: String, default: '' },
  boxes: { type: Array, default: () => [] },
})

const dimensions = reactive({ width: 1, height: 1 })
function onLoad(event) {
  dimensions.width = event.target.naturalWidth || 1
  dimensions.height = event.target.naturalHeight || 1
}
function boxStyle(box) {
  return {
    left: `${Math.max(0, box.x) / dimensions.width * 100}%`,
    top: `${Math.max(0, box.y) / dimensions.height * 100}%`,
    width: `${Math.max(0, box.w) / dimensions.width * 100}%`,
    height: `${Math.max(0, box.h) / dimensions.height * 100}%`,
  }
}
</script>

<style scoped>
.face-overlay { position: relative; overflow: hidden; border-radius: 6px; background: #e9eeec; }
.face-overlay img { display: block; width: 100%; max-height: 580px; object-fit: contain; }
.face-box { position: absolute; border: 2px solid #36d6ad; box-shadow: 0 0 0 1px rgb(0 0 0 / 20%); pointer-events: none; }
.face-box span { position: absolute; bottom: 100%; left: -2px; max-width: 220px; padding: 4px 7px; overflow: hidden; color: #08251f; background: #75e0be; font-size: 11px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
</style>

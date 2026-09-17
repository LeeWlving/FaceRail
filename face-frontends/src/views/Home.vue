<template>
  <div class="app-shell">
    <div v-if="drawerOpen" class="nav-backdrop" @click="drawerOpen = false"></div>
    <aside class="sidebar" :class="{ 'sidebar--open': drawerOpen }">
      <div class="brand-row">
        <div class="brand-mark">FR</div>
        <div>
          <strong>FaceRail</strong>
          <span>{{ t('app.console') }}</span>
        </div>
        <el-tooltip :content="t('app.closeNav')" placement="right">
          <button class="icon-button sidebar-close" type="button" @click="drawerOpen = false">
            <X :size="18" />
          </button>
        </el-tooltip>
      </div>

      <nav class="nav-groups" :aria-label="t('app.mainNav')">
        <section v-for="group in navigation" :key="group.labelKey" class="nav-group">
          <p>{{ t(group.labelKey) }}</p>
          <RouterLink v-for="item in group.items" :key="item.to" :to="item.to" class="nav-item">
            <component :is="item.icon" :size="18" />
            <span>{{ t(item.labelKey) }}</span>
            <ChevronRight class="nav-arrow" :size="15" />
          </RouterLink>
        </section>
      </nav>

      <div class="sidebar-status">
        <span class="status-dot"></span>
        <div>
          <strong>Rails API</strong>
          <span>PostgreSQL · pgvector</span>
        </div>
      </div>
    </aside>

    <main class="main-area">
      <header class="topbar">
        <el-tooltip :content="t('app.openNav')" placement="bottom">
          <button class="icon-button menu-button" type="button" @click="drawerOpen = true">
            <Menu :size="20" />
          </button>
        </el-tooltip>
        <div class="breadcrumb">
          <span>{{ t(route.meta.sectionKey) }}</span>
          <ChevronRight :size="14" />
          <strong>{{ t(route.meta.titleKey) }}</strong>
        </div>
        <div class="topbar-controls">
          <el-tooltip :content="t(inferenceMode === 'device' ? 'preferences.deviceHint' : 'preferences.cloudHint')" placement="bottom">
            <el-radio-group v-model="inferenceMode" class="mode-switch" size="small" :aria-label="t('preferences.inference')">
              <el-radio-button value="device"><Laptop :size="15" /><span>{{ t('preferences.device') }}</span></el-radio-button>
              <el-radio-button value="cloud"><Cloud :size="15" /><span>{{ t('preferences.cloud') }}</span></el-radio-button>
            </el-radio-group>
          </el-tooltip>
          <el-select v-model="locale" class="language-select" size="small" :aria-label="t('preferences.language')">
            <template #prefix><Languages :size="15" /></template>
            <el-option :label="t('preferences.chinese')" value="zh-CN" />
            <el-option :label="t('preferences.english')" value="en" />
          </el-select>
          <span class="topbar-version">API 2.1</span>
        </div>
      </header>

      <div class="page-stage">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <div :key="route.fullPath" class="route-page">
              <component :is="Component" />
            </div>
          </Transition>
        </RouterView>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  ChevronRight,
  CirclePlus,
  Cloud,
  Database,
  Eye,
  Languages,
  Laptop,
  ListFilter,
  Menu,
  ScanFace,
  Search,
  Trash2,
  UserRoundPlus,
  Users,
  X,
} from '@lucide/vue'
import { usePreferences } from '@/composables/usePreferences'

const route = useRoute()
const { t } = useI18n()
const { locale, inferenceMode } = usePreferences()
const drawerOpen = ref(false)

const navigation = computed(() => [
  {
    labelKey: 'nav.recognition',
    items: [
      { to: '/search', labelKey: 'nav.search', icon: Search },
      { to: '/compare', labelKey: 'nav.compare', icon: ScanFace },
    ],
  },
  {
    labelKey: 'nav.collections',
    items: [
      { to: '/collections', labelKey: 'nav.collectionList', icon: Database },
      { to: '/collections/create', labelKey: 'nav.collectionCreate', icon: CirclePlus },
      { to: '/collections/view', labelKey: 'nav.collectionView', icon: Eye },
      { to: '/collections/remove', labelKey: 'nav.collectionRemove', icon: Trash2 },
    ],
  },
  {
    labelKey: 'nav.data',
    items: [
      { to: '/samples', labelKey: 'nav.sampleList', icon: Users },
      { to: '/samples/create', labelKey: 'nav.sampleCreate', icon: UserRoundPlus },
      { to: '/samples/view', labelKey: 'nav.sampleView', icon: ListFilter },
      { to: '/faces/create', labelKey: 'nav.faceCreate', icon: ScanFace },
    ],
  },
])

watch(() => route.fullPath, () => {
  drawerOpen.value = false
})
</script>

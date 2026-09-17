<template>
  <div class="app-shell">
    <div v-if="drawerOpen" class="nav-backdrop" @click="drawerOpen = false"></div>
    <aside class="sidebar" :class="{ 'sidebar--open': drawerOpen }">
      <div class="brand-row">
        <div class="brand-mark">FR</div>
        <div>
          <strong>FaceRail</strong>
          <span>视觉检索控制台</span>
        </div>
        <el-tooltip content="关闭导航" placement="right">
          <button class="icon-button sidebar-close" type="button" @click="drawerOpen = false">
            <X :size="18" />
          </button>
        </el-tooltip>
      </div>

      <nav class="nav-groups" aria-label="主导航">
        <section v-for="group in navigation" :key="group.label" class="nav-group">
          <p>{{ group.label }}</p>
          <RouterLink v-for="item in group.items" :key="item.to" :to="item.to" class="nav-item">
            <component :is="item.icon" :size="18" />
            <span>{{ item.label }}</span>
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
        <el-tooltip content="打开导航" placement="bottom">
          <button class="icon-button menu-button" type="button" @click="drawerOpen = true">
            <Menu :size="20" />
          </button>
        </el-tooltip>
        <div class="breadcrumb">
          <span>{{ route.meta.section }}</span>
          <ChevronRight :size="14" />
          <strong>{{ route.meta.title }}</strong>
        </div>
        <span class="topbar-version">API 2.1</span>
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
import { ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import {
  ChevronRight,
  CirclePlus,
  Database,
  Eye,
  ListFilter,
  Menu,
  ScanFace,
  Search,
  Trash2,
  UserRoundPlus,
  Users,
  X,
} from '@lucide/vue'

const route = useRoute()
const drawerOpen = ref(false)

const navigation = [
  {
    label: '识别',
    items: [
      { to: '/search', label: '人脸搜索', icon: Search },
      { to: '/compare', label: '人脸比对', icon: ScanFace },
    ],
  },
  {
    label: '集合',
    items: [
      { to: '/collections', label: '集合列表', icon: Database },
      { to: '/collections/create', label: '创建集合', icon: CirclePlus },
      { to: '/collections/view', label: '查看集合', icon: Eye },
      { to: '/collections/remove', label: '删除集合', icon: Trash2 },
    ],
  },
  {
    label: '数据',
    items: [
      { to: '/samples', label: '样本列表', icon: Users },
      { to: '/samples/create', label: '创建样本', icon: UserRoundPlus },
      { to: '/samples/view', label: '查看样本', icon: ListFilter },
      { to: '/faces/create', label: '录入人脸', icon: ScanFace },
    ],
  },
]

watch(() => route.fullPath, () => {
  drawerOpen.value = false
})
</script>

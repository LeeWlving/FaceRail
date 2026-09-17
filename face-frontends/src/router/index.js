import { createRouter, createWebHistory } from 'vue-router'

const Home = () => import('@/views/Home.vue')

const routes = [
  {
    path: '/',
    component: Home,
    redirect: '/search',
    children: [
      { path: 'search', name: 'search', component: () => import('@/views/search/mVn.vue'), meta: { title: '人脸搜索', section: '识别' } },
      { path: 'compare', name: 'compare', component: () => import('@/views/compare/1v1.vue'), meta: { title: '人脸比对', section: '识别' } },
      { path: 'collections', name: 'collections', component: () => import('@/views/collect/list.vue'), meta: { title: '集合列表', section: '数据' } },
      { path: 'collections/create', name: 'collection-create', component: () => import('@/views/collect/create.vue'), meta: { title: '创建集合', section: '数据' } },
      { path: 'collections/view', name: 'collection-view', component: () => import('@/views/collect/view.vue'), meta: { title: '查看集合', section: '数据' } },
      { path: 'collections/remove', name: 'collection-remove', component: () => import('@/views/collect/remove.vue'), meta: { title: '删除集合', section: '数据' } },
      { path: 'samples', name: 'samples', component: () => import('@/views/sample/list.vue'), meta: { title: '样本列表', section: '数据' } },
      { path: 'samples/create', name: 'sample-create', component: () => import('@/views/sample/create.vue'), meta: { title: '创建样本', section: '数据' } },
      { path: 'samples/view', name: 'sample-view', component: () => import('@/views/sample/view.vue'), meta: { title: '查看样本', section: '数据' } },
      { path: 'samples/remove', name: 'sample-remove', component: () => import('@/views/sample/remove.vue'), meta: { title: '删除样本', section: '数据' } },
      { path: 'faces/create', name: 'face-create', component: () => import('@/views/face/create.vue'), meta: { title: '录入人脸', section: '数据' } },
    ],
  },
  { path: '/collect/list', redirect: '/collections' },
  { path: '/collect/create', redirect: '/collections/create' },
  { path: '/collect/view', redirect: (to) => ({ path: '/collections/view', query: to.query }) },
  { path: '/collect/remove', redirect: (to) => ({ path: '/collections/remove', query: to.query }) },
  { path: '/sample/list', redirect: '/samples' },
  { path: '/sample/create', redirect: '/samples/create' },
  { path: '/sample/view', redirect: (to) => ({ path: '/samples/view', query: to.query }) },
  { path: '/sample/remove', redirect: (to) => ({ path: '/samples/remove', query: to.query }) },
  { path: '/face/create', redirect: '/faces/create' },
  { path: '/search/mVn', redirect: '/search' },
  { path: '/compare/1v1', redirect: '/compare' },
  { path: '/:pathMatch(.*)*', redirect: '/search' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

export default router

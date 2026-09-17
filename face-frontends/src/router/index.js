import { createRouter, createWebHistory } from 'vue-router'

const Home = () => import('@/views/Home.vue')

const routes = [
  {
    path: '/',
    component: Home,
    redirect: '/search',
    children: [
      { path: 'search', name: 'search', component: () => import('@/views/search/mVn.vue'), meta: { titleKey: 'nav.search', sectionKey: 'nav.recognition' } },
      { path: 'compare', name: 'compare', component: () => import('@/views/compare/1v1.vue'), meta: { titleKey: 'nav.compare', sectionKey: 'nav.recognition' } },
      { path: 'collections', name: 'collections', component: () => import('@/views/collect/list.vue'), meta: { titleKey: 'nav.collectionList', sectionKey: 'nav.collections' } },
      { path: 'collections/create', name: 'collection-create', component: () => import('@/views/collect/create.vue'), meta: { titleKey: 'nav.collectionCreate', sectionKey: 'nav.collections' } },
      { path: 'collections/view', name: 'collection-view', component: () => import('@/views/collect/view.vue'), meta: { titleKey: 'nav.collectionView', sectionKey: 'nav.collections' } },
      { path: 'collections/remove', name: 'collection-remove', component: () => import('@/views/collect/remove.vue'), meta: { titleKey: 'nav.collectionRemove', sectionKey: 'nav.collections' } },
      { path: 'samples', name: 'samples', component: () => import('@/views/sample/list.vue'), meta: { titleKey: 'nav.sampleList', sectionKey: 'nav.data' } },
      { path: 'samples/create', name: 'sample-create', component: () => import('@/views/sample/create.vue'), meta: { titleKey: 'nav.sampleCreate', sectionKey: 'nav.data' } },
      { path: 'samples/view', name: 'sample-view', component: () => import('@/views/sample/view.vue'), meta: { titleKey: 'nav.sampleView', sectionKey: 'nav.data' } },
      { path: 'samples/remove', name: 'sample-remove', component: () => import('@/views/sample/remove.vue'), meta: { titleKey: 'nav.sampleRemove', sectionKey: 'nav.data' } },
      { path: 'faces/create', name: 'face-create', component: () => import('@/views/face/create.vue'), meta: { titleKey: 'nav.faceCreate', sectionKey: 'nav.data' } },
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

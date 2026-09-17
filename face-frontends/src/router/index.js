import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import {CollectCreate, CollectRemove, CollectList, CollectView} from '../views/collect'
import {SampleCreate, SampleView, SampleRemove, SampleList} from '../views/sample'
import {FaceCreate} from '../views/face'
import FaceSearchMvN from '../views/search/mVn'
import Compare1v1 from '../views/compare/1v1'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/collect',
    name: 'Collect',
    component: Home,
    children: [
      { path: 'create', component: CollectCreate },
      { path: 'remove', component: CollectRemove },
      { path: 'view', component: CollectView },
      { path: 'list', component: CollectList },
    ]
  }, {
    path: '/sample',
    name: 'Sample',
    component: Home,
    children: [
      { path: 'create', component: SampleCreate },
      { path: 'view', component: SampleView },
      { path: 'remove', component: SampleRemove },
      { path: 'list', component: SampleList },
    ]
  }, {
    path: '/face',
    name: 'Face',
    component: Home,
    children: [
      { path: 'create', component: FaceCreate },
    ]
  }, {
    path: '/search',
    name: 'Search',
    component: Home,
    children: [
      { path: 'mVn', component: FaceSearchMvN },
    ]
  }, {
    path: '/compare',
    name: 'Compare',
    component: Home,
    children: [
      { path: '1v1', component: Compare1v1 },
    ]
  }
]

const router = new VueRouter({
  routes
})

export default router

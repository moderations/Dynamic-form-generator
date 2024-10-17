import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/template-list',
    name: 'templateList',
    component: () => import(/* webpackChunkName: "template-list" */ '../template-manage/template-list.vue')
  },
  {
    name: 'TemplateConfig',
    path: '/template-config',
    component: () => import(/* webpackChunkName: "template-config" */ '../template-manage/template-config.vue'),
    props: route => ({...route.query})
  }
]

const router = new VueRouter({
  routes
})

export default router

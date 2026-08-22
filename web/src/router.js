import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  { path: '/', name: 'scenarios', component: () => import('./views/Scenarios.vue') },
  { path: '/runs', name: 'runs', component: () => import('./views/Runs.vue') },
  { path: '/report', name: 'report', component: () => import('./views/Report.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

export default createRouter({ history: createWebHashHistory(), routes });
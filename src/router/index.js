import { createRouter, createWebHistory } from 'vue-router';

import Home from '@/pages/Home.vue';
import About from '@/pages/About.vue';
import List from '@/pages/List.vue';
import Report from '@/pages/Report.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/about', name: 'about', component: About },
    { path: '/list', name: 'list', component: List },
    { path: '/report', name: 'report', component: Report },
  ],
});

export default router;

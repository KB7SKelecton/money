import { createRouter, createWebHistory } from 'vue-router';

import Home from '@/pages/Home.vue';
import List from '@/pages/List.vue';
import RegisterPage from '@/pages/RegisterPage.vue';
import Login from '@/pages/Login.vue';
// import MyPage from '@/pages/MyPage.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/list', name: 'list', component: List },
    // { path: '/mypage', name: 'mypage', component: MyPage },
    { path: '/register', name: 'register', component: RegisterPage },
    { path: '/login', name: 'login', component: Login },
  ],
});

router.beforeEach((to, from, next) => {
  const loggedInUser = localStorage.getItem('user');
  const isLoginPage = to.path === '/login';

  if (!isLoginPage && !loggedInUser) {
    alert('로그인이 필요한 서비스입니다.');
    next('/login');
  } else if (isLoginPage && loggedInUser) {
    next('/main');
  } else {
    next();
  }
});

export default router;

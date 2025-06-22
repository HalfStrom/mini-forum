import { createRouter, createWebHistory } from 'vue-router';
import Posts from './components/Posts.vue';
import PostForm from './components/PostForm.vue';
import Home from './components/Home.vue';
import Login from './components/Login.vue';
import Chat from './components/Chat.vue';

const routes = [
  { path: '/posts', component: Posts },
  { path: '/create-post', component: PostForm },
  { path: '/edit-post/:id', component: PostForm, props: true },
  { path: '/login', component: Login },
  { path: '/chat', component: Chat },
  { path: '/', component: Home },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (to.path !== '/login' && !token) {
    next('/login');
  } else {
    next();
  }
});

export default router;
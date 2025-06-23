import { createRouter, createWebHistory } from 'vue-router';
import Posts from './components/Posts.vue';
import PostForm from './components/PostForm.vue';
import PostDetail from './components/PostDetail.vue';
import Home from './components/Home.vue';
import Login from './components/Login.vue';
import Profile from './components/Profile.vue';
import UserProfile from './components/UserProfile.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/posts', component: Posts },
  { path: '/post/:id', component: PostDetail },
  { path: '/login', component: Login },
  { path: '/user/:id', component: UserProfile },
  { 
    path: '/create-post', 
    component: PostForm,
    meta: { requiresAuth: true }
  },
  { 
    path: '/edit-post/:id', 
    component: PostForm, 
    props: true,
    meta: { requiresAuth: true }
  },
  { 
    path: '/profile', 
    component: Profile,
    meta: { requiresAuth: true }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  
  // Se a rota requer autenticação e não há token
  if (to.meta.requiresAuth && !token) {
    next('/login');
  }
  // Se está tentando acessar login mas já está autenticado
  else if (to.path === '/login' && token) {
    next('/posts');
  }
  // Caso contrário, permite o acesso
  else {
    next();
  }
});

export default router;
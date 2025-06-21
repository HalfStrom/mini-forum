import { createRouter, createWebHistory } from 'vue-router';
import Home from './components/Home.vue';
import Login from './components/Login.vue';
import Posts from './components/Posts.vue';
import PostForm from './components/PostForm.vue';

const routes = [
    { path: '/', component: Home },
    { path: '/posts', component: Posts},
    { path: '/login', component: Login },
    { path: '/create-post', component: PostForm },
    { path: '/edit-post/:id', component: PostForm },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Proteção de rotas
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    if (to.path === '/create-post' && !token) {
        next('/login');
    } else {
        next();
    }
});

export default router;
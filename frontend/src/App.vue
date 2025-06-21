<template>
  <div class="container">
    <nav>
      <router-link to="/">Posts</router-link> | 
      <router-link v-if="!isLoggedIn" to= "/login">Login</router-link>
      <router-link v-if="isLoggedIn" to= "/create-post">Criar Post</router-link>
      <button v-if="isLoggedIn" @click="logout">Logout</button>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    computed: {
      isLoggedIn() {
        return !!localStorage.getItem('token');
      },
    },
    methods: {
      logout() {
        localStorage.removeItem('token');
        this.$router.push('/login');
      },
    },
  };
</script>

<style scoped>
.container { max-width: 800px; margin: 0 auto; padding: 20px; }
nav { margin-bottom: 20px; }
</style>
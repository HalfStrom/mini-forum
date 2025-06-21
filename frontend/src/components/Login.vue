<template>
    <div>
        <h2>{{ isRegister ? 'Registrar' : 'Login' }}</h2>
        <form @submit.prevent="handleSubmit">
            <input v-model="username" type="text" placeholder="Usuário" required />
            <input v-model="password" type="password" placeholder="Senha" required />
            <button type="submit">{{ isRegister ? 'Registrar' : 'Entrar' }}</button>
        </form>
        <p>
            <a href="#" @click="isRegister = !isRegister">
                {{ isRegister ? 'Já tem uma conta? Faça seu login' : 'Não tem conta? Registre-se'}}
            </a>
        </p>
    </div>
</template>

<script>
    import axios from 'axios';

    export default {
        data() {
            return {
                username: '',
                password: '',
                isRegister: false,
            };
        },
        methods: {
            async handleSubmit() {
                try {
                    const endpoint = this.isRegister ? '/api/auth/register' : '/api/auth/login';
                    const response = await axios.post(`http://localhost:3000${endpoint}`,
                        {
                            username: this.username,
                            password: this.password,
                        });

                    if (this.isRegister) {
                        alert('Registrado com sucesso! Faça login.');
                        this.isRegister = false;
                    } else {
                        localStorage.setItem('token', response.data.token);
                        this.$router.push('/');
                    }
                } catch (error) {
                    alert(error.response?.data?.error || 'Erro ao processar');
                }
            },
        },
    };
</script>

<style scoped>
    form {
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 300px;
    }

    input,
    button {
        padding: 8px;
    }
</style>
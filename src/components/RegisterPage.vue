<template>
    <form @submit.prevent="onSubmit" class="container">
        <div class="title">
            Register Page
        </div>
        <div class="login-box">
            <input v-model="user.username" placeholder="username" type="text">
        </div>
        <div class="login-box">
            <input v-model="user.email" placeholder="email" type="text">
        </div>
        <div class="login-box">
            <input v-model="user.password" placeholder="password" type="password">
        </div>
        <div class="login-box">
            <button type="submit">Register</button>
        </div>
        <div class="login-box">
            <router-link class="link" to="/login">Do you already have an account?</router-link>
        </div>
    </form>
</template>

<script>
export default {
    name: 'RegisterPage',
    data() {
        return {
            user: {
                username: '',
                email: '',
                password: ''
            }
        };
    },
    methods: {
        onSubmit() {
            this.$store.dispatch('register', this.user)
                .then(() => {
                    this.$router.push("/login");
                })
                .catch(error => {
                    console.error('Registration error:', error);
                });
        }
    }
};
</script>



<style scoped>
    .container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 700px;
    }
    .title {
        font-size: 20px;
        margin-bottom: 20px;
        font-weight: bold;
    }
    .login-box {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40%;
        height: 60px;
    }
    input {
        font-size: 15px;
        padding: 10px;
        margin-top: 10px;
        border-radius: 5px;
        border: 1px solid rgba(0, 0, 0, 0.402);
    }
    button {
        font-size: 15px;
        padding-left: 20px;
        padding-right: 20px;
        padding-top: 10px;
        padding-bottom: 10px;
        border-radius: 5px;
        border: 1px solid rgba(0, 0, 0, 0.479);
        background-color: rgba(156, 246, 176, 0.512);
        transition: background .5s ease;
    }
    button:hover {
        background-color: rgba(156, 246, 176, 0.742);
        cursor: pointer;

    }
    .link {
        text-decoration: none;
        color: rgba(36, 38, 36, 0.992);
    }
</style>
<template>
    <div class="container">
        <div class="header">
            <div class="settings" :class="logoutClass">
                <a class="exitButton" @click.prevent="logout" href="#">Exit</a>
            </div>
        </div>
        <div class="feature">
            <ChatHistory :messages="messages" @sendMessage="sendMessage"></ChatHistory>
        </div>
    </div>
</template>

<script>
import ChatHistory from './ChatHistory.vue'
import { mapActions } from 'vuex';

export default {
    name: 'HomePage',
    components: {
        ChatHistory
    },
    computed: {
    },
    methods: {
        ...mapActions(['logout', 'sendMessage']),
    },
    created() {
    }

}
</script>


<style scoped>
    .header {
        width: 100%;
        display: flex;
    }
    .settings {
        margin-left: 80%;
        margin-top: 3%;
        width: 20%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .feature {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
    }
    button {
        padding: 10px;
        border-radius: 5px;
        background-color: rgba(250, 235, 215, 0.298);
        border: 1px solid rgba(0, 0, 0, 0.519);
        transition: background 0.5s ease;
    }
    button:hover {
        background-color: rgba(156, 246, 176, 0.512);
        cursor: pointer;
    }
    .exitButton {
        text-decoration: none;
        color: black;
        padding: 10px;
        border-radius: 5px;
        background-color: rgba(250, 235, 215, 0.298);
        border: 1px solid rgba(0, 0, 0, 0.519);
        transition: background 0.5s ease;
    }
    .exitButton:hover {
        background-color: rgba(156, 246, 176, 0.512);
        cursor: pointer;
    }

</style>
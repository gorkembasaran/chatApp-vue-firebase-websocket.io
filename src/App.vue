<template>
  <div class="container">
    <router-view />
  </div>
</template>

<script>

export default {
  name: 'App',
  components: {
  },
  created(){
    this.$store.dispatch("initAuth")
  }
}
</script>

<style>
  body {
    margin: 0;
    background-color: rgba(168, 184, 206, 0.523);
    color: rgb(72, 74, 74);
    font-family: system-ui, -apple-system, /* Firefox supports this but not yet `system-ui` */ 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
  }
</style>

<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <div>(test1)Home页面</div>
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@test1/components/HelloWorld.vue'

export default {
  name: 'home',
  components: {
    HelloWorld
  }
}
</script>

<template>
  <div id="app">
    <img src="./assets/logo.png">
    <!--页面跳转-->
    <ul>
      <li>
        <router-link style="color: #2384E8" :to="{ name: 'Hello'}">
          Hello
        </router-link>
      </li>
      <li>
        <router-link style="color: #9F7860" :to="{ name: 'Map'}">
          地图
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
  import Map from './components/Map';
  import Hello from './components/Hello';
  export default {
    name: 'app',
    data(){
      return {
        map: Map,
        hello: Hello,
      }
    }
  }
</script>

<style scoped>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }
</style>

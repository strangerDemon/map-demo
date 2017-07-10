<template>
  <div class="playback">
  </div>
</template>

<script>
  export default {
    name: 'playback',
    //模板
    components: {},
    data() {
      return {}
    },
    //默认
    props: {
      show: {
        type: Boolean,
        default: false
      }
    },
    filters: {},
    //初始化参数
    computed: {},
    watch: {},
    methods: {
      test(val) {
        alert(val)
      },
    },
    mounted() {

    }
  }

</script>
<style>

</style>

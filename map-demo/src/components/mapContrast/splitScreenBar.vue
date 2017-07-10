<template>
  <div class="split-screen-bar" v-drag="{'dragElm':'move'}">
    <el-button size="mini" class="ion-arrow-move" ref="move"></el-button>
    <el-button-group class="btn-group">
      <el-button :class="action=='splitScreen'?'ion-android-image':'ion-image'" @click="Init('splitScreen')"><span
        class="text">分屏对比</span>
      </el-button>
      <el-button :class="action=='shutter'?'ion-ios-printer':'ion-ios-printer-outline'" @click="Init('shutter')"><span
        class="text">卷帘对比</span></el-button>
      <el-button :class="action=='payback'?'ion-ios-recording-outline':'ion-ios-recording'" @click="Init('playback')">
        <span class="text">影像播放</span></el-button>
      <el-button class="icon-close el-icon-close" @click="handleClickBtn('close')"></el-button>
    </el-button-group>
    <el-dialog :title="title.get(action)" size="large" :modal=false :close-on-click-modal=false :visible.sync="splitScreenShow">
      <split-screen v-show="action=='splitScreen'?true:false"></split-screen>
      <shutter v-show="action=='shutter'?true:false"></shutter>
      <playback v-show="action=='playback'?true:false"></playback>
    </el-dialog>
  </div>
</template>

<script>
  import drag from '@/utils/drag'
  import splitScreen from './splitScreen.vue'
  import shutter from './shutter.vue'
  import playback from './playback.vue'
  export default {
    name: 'split-screen-bar',
    directives: {drag},
    //模板
    components: {
      splitScreen,
      shutter,
      playback
    },
    data() {
      return {
        action: "",
        splitScreenShow: false,
        title: new Map([['splitScreen', '分屏对比'], ['shutter', '卷帘对比'],['playback', '影像播放'],]),
      }
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
      Init(action){
        let vm = this;
        vm.action = action;
        vm.splitScreenShow = true;
      },
      handleClickBtn(){
        vm.splitScreenShow = false;
        this.$emit('show', false);
      },
    },
    mounted() {

    }
  }

</script>
<style>
  .split-screen-bar {
    position: fixed;
    right: 33px;
    top: 60px;
    width: 300px;

  &
  .btn-group {

  &
  .el-button {
    padding: 8px;
    color: #3385ff;
  }

  }
  &
  .icon {
    font-size: 16px;
  }

  &
  .icon-close, {
    line-height: 16px;
    font-size: 8px;
  }

  &
  .text {
    font-size: 13px;
    color: #444;
    margin-left: 8px;
  }

  }
</style>

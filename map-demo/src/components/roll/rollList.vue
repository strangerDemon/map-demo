<template>
  <div class="rollList" v-drag="{'dragElm':'move'}">
    <el-button v-show="isDrag" size="mini" class="ion-arrow-move" ref="move"></el-button>
    <transition-group v-if="rollClass === 'card'" name=".list-complete">
      <el-row :span="1" v-for="(o, index) in list" :key="o" :offset="index">
        <el-col class="list-complete-item" v-show="showNum!=0?index<showNum?true:false:true">
          <el-card :body-style="{ padding: '0px' }">
            <div style="padding: 14px;" @click="openNews(o.url)">
              <span class="el-badge__content">{{index+1}}</span>
              <span>{{o.title}}</span>
              <div class="bottom clearfix">
                <time class="time">{{ o.date }}</time>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </transition-group>
    <div class="roll-tip" v-if="rollClass === 'tip'">
      <div class="el-tooltip__popper layerTip" x-placement="left" v-for="(item,index) in list" :key="item.type"
           :style="isTipSingleBgColor?'background-color:'+bgColor[8]+'!important;':'background-color:'+bgColor[index%bgColor.length]+'!important;'">
        <div class="tipDiv" @click="openNews(item.url)">

          <el-tooltip effect="dark" :content="item.title" placement="top-start">
            <span class="itemTitle">
                <i class="ion-social-twitch-outline" style="font-size: x-large"></i>
              {{item.title}}
            </span>
          </el-tooltip>
          <div x-arrow="" class="popper__arrow" style="top: 12px;"></div>
        </div>
      </div>
    </div>
  </div>

</template>

<style>

  .rollList {
    position: fixed;
    right: 10px;
    top: 60px;
    width: 364px;
  }

  .time {
    float: right
  }

  .el-badge__content {
    background-color: #58B7FF;
  }

  .list-complete-item {
    transition: all 1s;
    display: inline-block;
    margin-right: 10px;
  }

  .el-tooltip__popper{
    padding: 8px;
  }
  .roll-tip {
    bottom: 12px;
    position: fixed;
    float: right;
    right: inherit;
    min-width: 300px;
    max-width: 350px;
  }

  .layerTip {
   /* background-color: rgba(17, 19, 22, 0.5) !important;*/
    position: relative;
    margin-top: 6px;
  }

  .el-tag{
    border-radius: 10px;
    background-color:"#FFF";
  }

  .tipDiv:hover{
    cursor:pointer;
  }
  .itemTitle{
    color: aliceblue;
    font-size: medium;
    display: block;
    width:300px;/*对宽度的定义,根据情况修改*/
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .itemTitle:hover{
    color: #93a7c2;
    text-decoration:underline;
  }
</style>

<script>
  import {asmx} from '@/utils'
  import drag from '@/utils/drag'

  export default{
    name: "rollList",
    directives: {drag},
    data(){
      return {
          bgColor:['#FFF68F','#FFB90F','#FF8C00','#FF4500','#FF0000','#ADFF2F','#76EE00','#AEEEEE','#1E90FF','#006400'],
          list:[],
      }
    },
    props: {
      dataList:{//数据源
        type: Array,
        default: []
      },
      showNum:{//展示列表条数，0 不限制
        type: Number,
        default: 0
      },
      closeDate:{//自动关闭时间
        type: Number,
        default: 10000
      },
      rollDate:{//滚动时间
        type: Number,
        default: 1000
      },
      rollClass: { //样式 normal、notifications、notification
        type: String,
        default: "card"
      },
      isDrag: {//是否拖拽
        type: Boolean,
        default: false
      },
      isRoll: {//是否滚动
        type: Boolean,
        default: true
      },
      isTipSingleBgColor:{//tip 样式是否单色调
          type: Boolean,
          default: true},
      TipColor:{//展示列表条数，0 不限制
        type: Number,
        default: 7
      },
    },

    components: {},
    computed: {},
    methods: {
      openNews(url){
        window.open(url);
      },
      roll(){
        let vm = this;
        if (vm.list.length > 0) {
          setInterval(function () {
            let item = vm.list[0]
            vm.list.splice(0, 1)
            vm.list.push(item);
          }, 1000);
        }
      },
      addItem(){
        let vm = this;
        let listItems = vm.dataList;
        vm.list = [];
        for (let i = 0; i < listItems.length && ((vm.showNum > 0 && i < vm.showNum) || vm.showNum == 0); i++) {
          //设置 setInterval 执行的次数
          let count = 1;
          let interval = setInterval(function () {
            vm.list.push(listItems[i]);
            if (count--)
              clearInterval(interval);
          }, i * 100);
        }
      },
      removeItem(){
        let vm = this;
        for (let i = 0; i < vm.list.length && ((vm.showNum > 0 && i < vm.showNum) || vm.showNum == 0); i++) {
          //设置 setInterval 执行的次数
          let count = 1;
          let interval = setInterval(function () {
            vm.list.splice(0, 1);
            if (count--)
              clearInterval(interval);
          }, i * 100);
        }
      },
      notification(){
        let vm = this;
        vm.list=vm.dataList;
        if (vm.list.length > 0) {
          for (let i = 0; i < vm.list.length && ((vm.showNum > 0 && i < vm.showNum) || vm.showNum == 0); i++) {
            //设置 setInterval 执行的次数
            let count = 1;
            let interval = setInterval(function () {
              vm.$notify({
                title: vm.list[i].title,
                message: vm.list[i].date,
                offset: 100,
                duration: vm.closeDate,
              });
              if (count--)
                clearInterval(interval);
            }, i * 100);
          }
        }
      },
    },
    mounted() {
      let vm=this;
      if(vm.rollClass==="notification"){
          vm.notification();
      }
      if(vm.rollClass==="tip"){
          vm.addItem();
      }
      if(vm.isRoll) {
        this.roll();
      }
      if (vm.closeDate > 0) {
        let interval =setInterval(function () {
          vm.removeItem();
          clearInterval(interval);
        }, vm.closeDate);
      }
    },
  }
</script>

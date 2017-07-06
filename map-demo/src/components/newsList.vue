<template>
  <div class="newList">
    <roll-list :dataList="newList" rollClass="tip" :closeDate="10000" :isDrag="false" :isRoll="false"  ></roll-list>
   <!-- <roll-list :dataList="newList" rollClass="notification" :closeDate="4000" :isDrag="false" :isRoll="false"  ></roll-list>-->
  </div>

</template>

<style>
  .newList{
    position: fixed;
    right: 10px;
    top: 60px;
    width: 364px;
  }
</style>

<script>
  import rollList from './roll/rollList.vue'
  import {asmx} from '@/utils'

  export default{
    name: "newList",
    data(){
      return {
        newList:[{id:1,title:"这是一个很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长的title",url:"https://www.baidu.com",date:"2017-6-30"},
          {id:1,title:"this a long long long long long long long title",url:"https://www.baidu.com",date:"2017-6-30"},
          {id:2,title:"这是一个很长很长很长很长很长的title",url:"https://www.baidu.com",date:"2017-6-30"},
          {id:3,title:"这是一个很长很长很长很长的title",url:"https://www.baidu.com",date:"2017-6-30"},
          {id:4,title:"这是一个很长很长很长的title",url:"https://www.baidu.com",date:"2017-6-30"},
          {id:5,title:"这是一个很长很长的title",url:"https://www.baidu.com",date:"2017-6-30"},
          {id:6,title:"这是一个很长的title",url:"https://www.baidu.com",date:"2017-6-30"},
          {id:7,title:"这是一个title",url:"https://www.baidu.com",date:"2017-6-30"},
          {id:8,title:"这是短title",url:"https://www.baidu.com",date:"2017-6-30"},
          {id:9,title:"这是title",url:"https://www.baidu.com",date:"2017-6-30"},
          {id:10,title:"title",url:"https://www.baidu.com",date:"2017-6-30"}],
        timer: null,
        hover: false
      }
    },
    components: {
      rollList
    },
    computed:{
    },
    methods: {
      getNewList() {
        const vm = this
        asmx.post('getNewsList').then(function (resp) {
          const arr = []
          resp.forEach(item => arr.push(item))
          vm.newList = arr
        })

      },
    },
    mounted() {
        this.getNewList();
    },
  }
</script>

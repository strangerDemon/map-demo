<template>
  <div class="splitScreen">
    <div id="left" class="mapDiv" style="float: left;">
      <el-select v-model="leftSelect" multiple filterable placeholder="" :multiple-limit=2>
        <el-option
          v-for="item in MapOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <div id="leftMapDiv"></div>
    </div>
    <div id="right" class="mapDiv" style="float: right;">
      <el-select v-model="rightSelect" multiple filterable placeholder="" :multiple-limit=2>
        <el-option
          v-for="item in MapOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <div id="rightMapDiv"></div>
    </div>
  </div>
</template>
/**
* 分屏对比
*/
<script>
  import {asmx} from '@/utils'

  export default {
    name: 'splitScreen',
    //模板
    components: {},
    data() {
      return {
        //下拉框
        MapOptions: [],
        leftSelect: [],
        rightSelect: [],
        //地图
        leftMap: null,
        rightMap: null,
        curMap: null,
        layers: [],
        option: {
          logo: false,
          center: [118.133988, 24.5698],
          zoom: 10,
          slider: false,
          nav: true,
          fadeOnZoom: true,
        },
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
    watch: {
      leftSelect(){
        let vm = this;
        console.log("leftSelect", vm.leftSelect);
        vm.removeAllLayer(vm.leftMap);
        for (let i = 0; i < vm.leftSelect.length; i++) {
          Array.from(vm.layers).forEach(function (layer) {
            //console.log(layer);
            if (layer.id == vm.leftSelect[i]) {
              vm.addLayerToMap(layer.id, layer.url, layer.type, "left");
            }
          });
        }
      },
      rightSelect(){
        let vm = this;
        console.log("rightSelect", this.rightSelect);
        vm.removeAllLayer(vm.rightMap);
        for (let i = 0; i < vm.rightSelect.length; i++) {
          Array.from(vm.layers).forEach(function (layer) {
            //console.log(layer);
            if (layer.id == vm.rightSelect[i]) {
              vm.addLayerToMap(layer.id, layer.url, layer.type, "right");
            }
          });
        }
      }
    },
    methods: {
      getMapOptinos() {
        let vm = this
        asmx.post('getMapContrastPara').then(function (resp) {
          console.log("getMapContrastPara:", resp);
          resp.forEach(item => vm.layers.push(item));
          resp.forEach(item => vm.MapOptions.push({value: item.id, label: item.name}));
          vm.initAddLayer();
        })
      },

      init(){
        let vm = this;
        vm.leftMap = new esri.Map("left", vm.option);
        vm.rightMap = new esri.Map("right", vm.option);
        vm.getMapOptinos();

        dojo.connect(vm.leftMap, "onMouseOver", function (extent) {
          vm.curMap = "left";
        });

        dojo.connect(vm.rightMap, "onMouseOver", function (extent) {
          vm.curMap = "right";
        });

        dojo.connect(vm.leftMap, "onExtentChange", function (extent) {
          if (vm.curMap == "left") {
            vm.rightMap.setExtent(extent, false);
          }
        });
        dojo.connect(vm.rightMap, "onExtentChange", function (extent) {
          if (vm.curMap == "right") {
            vm.leftMap.setExtent(extent, false);
          }
        });
      },
      //初始化加载图层
      initAddLayer(){
        let vm = this;
        if(vm.layers!=null&&vm.layers.length>0) {
          let slayer = new esri.layers.ArcGISTiledMapServiceLayer(vm.layers[0].url);
          slayer.id = vm.layers[0].id;
          vm.leftMap.addLayer(slayer);
          vm.leftSelect[0]=vm.layers[0].id;
          if(vm.layers.length>1){
            slayer = new esri.layers.ArcGISTiledMapServiceLayer(vm.layers[1].url);
            slayer.id = vm.layers[1].id;
            vm.rightMap.addLayer(slayer);
            vm.rightSelect[0]=vm.layers[1].id;
          }else{
            vm.rightMap.addLayer(slayer);
            vm.rightSelect[0]=vm.layers[0].id;
          }
        }
      },
      addLayerToMap(layerid, url, maptype, tag) {
        let vm = this;
        let slayer = new esri.layers.ArcGISTiledMapServiceLayer(url);
        slayer.id = layerid;
        switch (tag) {
          case "left":
            vm.leftMap.addLayer(slayer);
            break;
          case "right":
            vm.rightMap.addLayer(slayer);
            break;
          default:
            break;
        }
      },
      /**
       * map 移除layer
       * @param map
       * @param id
       */
      removeLayer (map, id) {
        let ly = map.getLayer(id);
        if (ly) {
          map.removeLayer(ly);
        }
      },
      removeAllLayer(map){
        if (map != null) {
          map.removeAllLayers();
        }
      },
    },
    mounted() {
      this.init();
    }
  }

</script>
<style>
  .splitScreen{
    height:80%;
  }
  .mapDiv {
    width: 49.9%;
    /*height: 80%;*/
    height:700px ;
    border: 1px solid #0092CF;
    margin-bottom: 30px
  }

  .el-select {
    display: block;
  }

  .el-dialog--large {
    top: 10% !important;
  }
  .el-dialog__body{
    padding: 10px 20px;
  }
  .esriMapContainer{
   /* height:100%;*/
  }
</style>

<template>
  <div class="shutter">
    <!--页面LEFT-->
    <div class="shutterCheckDiv">
      <div class="checked">
        <span>卷帘模式:</span>
        <el-checkbox-group v-model="checkTypes" change="changeType">
          <el-checkbox v-for="type in types" :checked="type.checked" :label="type" :key="type">{{type.label}}
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <div class="checked fullWidth">
        <span>选择遮罩层：</span>
        <el-checkbox-group v-model="overOptions" :max="2">
          <el-checkbox v-for="mapOption in mapOptions" :label="mapOption" :key="mapOption">{{mapOption.label}}
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <div class="checked fullWidth">
        <span>选择对比层:</span>
        <el-checkbox-group v-model="comparedOptions" :max="2">
          <el-checkbox v-for="mapOption in mapOptions" :label="mapOption" :key="mapOption">{{mapOption.label}}
          </el-checkbox>
        </el-checkbox-group>
      </div>
    </div>
    <!--页面RIGHT-->
    <div id="shutterMap" class="shutterMapDiv">
    </div>
  </div>
</template>

<script>
  import {asmx} from '@/utils'

  export default {
    name: 'shutter',
    //模板
    components: {},
    data() {
      return {
        //卷帘类型
        types: [{label: '垂直分割', value: 1, checked: true}, {label: '水平分割', value: 2}],
        checkTypes: [],
        //地图类型
        mapOptions: [],
        overOptions: [],
        comparedOptions: [],

        map: null,
        layers: [],
        overLayers: [],
        comparedLayers: [],
        mapOption: {
          logo: false,
          center: [118.133988, 24.5698],
          zoom: 11,
          slider: false,
          nav: true,
          fadeOnZoom: true,
        },

        magnifyObj: null,
        maptoplayer: null,
        _map_drag: null,
        flagPan: true,
        ishorizontalswipe: true,
        isverticalswipe: false,
      }
    },
    //默认
    props: {},
    filters: {},
    //初始化参数
    computed: {},
    watch: {
      overLayers(val){
         // console.log("overLayers ",val);
      },
      comparedLayers(){
        //console.log("comparedLayers ",this.comparedLayers);
      },
      checkTypes(){
        let vm = this;
        console.log("checkTypes ",vm.checkTypes);
        vm.ishorizontalswipe = vm.checkTypes.length>1||(vm.checkTypes.length==1&&vm.checkTypes[0].value==1)? true : false;
        vm.isverticalswipe = vm.checkTypes.length>1||(vm.checkTypes.length==1&&vm.checkTypes[0].value==2)? true : false;
      },
      overOptions(){
        let vm=this;
        console.log("overOptions ",vm.overOptions);
        vm.initMapLayers();
      },
      comparedOptions(){
        let vm = this;
        console.log("comparedOptions ",vm.comparedOptions);
        vm.initMapLayers();
      }
    },
    methods: {
      init(){
        let vm = this;
        vm.getMapOptinos();
      },

      getMapOptinos() {
        let vm = this
        asmx.post('getMapContrastPara').then(function (resp) {
          // console.log("shutter getMapContrastPara:", resp);
          resp.forEach(item => vm.layers.push(item));
          resp.forEach(item => vm.mapOptions.push({value: item.id, label: item.name}));
          //默认选中状态
          if (vm.mapOptions.length > 1) {
            vm.overOptions.push(vm.mapOptions[1]);
            vm.comparedOptions.push(vm.mapOptions[0]);
          } else if (vm.mapOptions.length > 0) {
            vm.overOptions.push(vm.mapOptions[0]);
          } else {
            return;
          }
          //其他的初始化
          vm.map = new esri.Map("shutterMap", vm.mapOption);
          vm.map.on("load", function () {
            vm.map.disablePan();
          });

          //初始化地图服务列表
          vm.initMapLayers();

          vm.beginShutter();
        })
      },

      createLayer(layerid, url) {
        let slayer = new esri.layers.ArcGISTiledMapServiceLayer(url);
        slayer.id = layerid;
        return slayer;
      },

      //开始卷帘操作
      beginShutter () {
        let vm = this;
        if (vm.overLayers.length < 0 || vm.comparedLayers.length < 0) {
          return;
        }
        vm.InitSwipe();
      },

      //初始化地图卷帘图层
      initMapLayers () {
        let vm = this;
        vm.clearSwipe();
        vm.removeOverLayers();
        vm.removeComparedLayers();
        let overLayer;
        let comparedLayer;
        //坑爹，有顺序要求
        for (let i = 0; i < vm.comparedOptions.length; i++) {
          Array.from(vm.layers).forEach(function (layer) {
            if (layer.id == vm.comparedOptions[i].value) {
              comparedLayer = vm.createLayer("compared_" + layer.id, layer.url);
              vm.comparedLayers.push(comparedLayer);
              vm.addComparedLayerToMap(comparedLayer);
            }
          });
        }
        for (let i = 0; i < vm.overOptions.length; i++) {
          Array.from(vm.layers).forEach(function (layer) {
            if (layer.id == vm.overOptions[i].value) {
              overLayer = vm.createLayer("over_" + layer.id, layer.url);
              vm.overLayers.push(overLayer);
              vm.addOverLayerToMap(overLayer);
            }
          });
        }
        vm.InitSwipe();
      },

      //添加地图到地图遮罩层
      addOverLayerToMap (ly) {
        let vm = this;
        vm.map.addLayer(ly)
      },

      //添加地图到地图对比层
      addComparedLayerToMap (ly) {
        let vm = this;
        //let index = vm.comparedLayers.length;
        vm.map.addLayer(ly);
      },

      //移除所有遮罩层
      removeOverLayers(){
        let vm = this;
        let length = vm.overLayers.length;
        for (let i = 0; i < length; i++) {
          document.getElementById("shutterMap_"+vm.overLayers[0].id).remove();
          vm.map.removeLayer(vm.overLayers[0]);
          vm.overLayers.splice(0, 1);
        }
      },
      //移除所有对比层
      removeComparedLayers(){
        let vm = this;
        let length=vm.comparedLayers.length;
        for (let i = 0; i < length; i++) {
          document.getElementById("shutterMap_"+vm.comparedLayers[0].id).remove();
          vm.map.removeLayer(vm.comparedLayers[0]);
          vm.comparedLayers.splice(0, 1);
          //
        }
      },
      InitSwipe () {
        let vm = this;
        this.dojoRequire(["dojo/on"], function (on) {
          vm.map.disablePan();
          vm._map_drag = on(vm.map, "mouse-drag", function (e) {
            e.stopPropagation();
            if (!vm.flagPan) {
              vm.map.disablePan();
            }
            let offsetX = e.screenPoint.x;
            let offsetY = e.screenPoint.y;

            vm.currentSwitchMapoffsetX = offsetX;
            vm.currentSwitchMapoffsetY = offsetY;

            for (let i = 0; i < vm.overLayers.length; i++) {
              let divID = "shutterMap_" + vm.overLayers[i].id;
              let maptoplayer = $("#" + divID)[0];

              vm.refreshDivSize(offsetX, offsetY, maptoplayer);
            }
          });

        });
      },

      clearSwipe() {
        let vm = this;
        if (vm._map_drag != undefined) {
          vm._map_drag.remove();

          //  mapswipe.map.enablePan();
          if (vm.maptoplayer != null) {
            let offsetX = vm.map.width;
            let offsetY = vm.map.height;
            vm.refreshDivSize(offsetX, offsetY, this.maptoplayer);
            vm.maptoplayer.style.clip = "auto";
          }
        }
      },

      refreshDivSize(offsetX, offsetY, mapdiv) {
        let vm = this;
        let origin = vm.getLayerTransform(mapdiv);
        let cliptop = -origin.y + "px";
        let clipleft = -origin.x + "px";//clip的左上起点
        let clipbottom;
        let clipright;
        let map1toplayerdiv = mapdiv;
        let mapheightpx = map1toplayerdiv.style.height;
        let mapwidthpx = map1toplayerdiv.style.width;

        let mapheight = parseInt(mapheightpx.substring(0, mapheightpx.lastIndexOf('px')));//去掉单位px 取出数值
        let mapwidth = parseInt(mapwidthpx.substring(0, mapwidthpx.lastIndexOf('px')));

        clipbottom = vm.ishorizontalswipe ? (offsetY - origin.y) + 'px' : (mapheight - origin.y) + 'px';
        clipright = vm.isverticalswipe ? (offsetX - origin.x) + "px" : (mapwidth - origin.x) + "px";

        mapdiv.style.clip = 'rect(' + cliptop + ',' + clipright + ',' + clipbottom + ',' + clipleft + ')';
      },

      getLayerTransform(layer) {
        let xorigin, yorigin, layerstyle = layer.style;
        if (layerstyle['-webkit-transform']) {//chrome
          let s = layerstyle['-webkit-transform'];//格式为"translate(0px, 0px)"
          let xyarray = s.replace(/translate\(|px|\s|\)/, '').split(',');
          xorigin = parseInt(xyarray[0]);
          yorigin = parseInt(xyarray[1]);
        } else if (layerstyle['transform']) {//firefox
          let layertransforstring = layerstyle['transform'];
          let xyz = layertransforstring.replace(/px|\s|translate3d\(|px|\)/g, '').split(',');
          xorigin = parseInt(xyz[0]);
          yorigin = parseInt(xyz[1]);
        } else {//ie 8+
          xorigin = parseInt(layer.style.left.replace('px', ''));
          yorigin = parseInt(layer.style.top.replace('px', ''));
        }
        return {
          x: xorigin,
          y: yorigin
        }
      },
    },

    mounted() {
      this.init();
    }
  }

</script>
<style>
  .shutter {
    height: 700px;
  }

  .checked {
    margin: 10px;
    font-size: 14px;
  }

  .shutterMapDiv {
    float: right;
    margin-right: 15px;
    width: 79%;
    height: 95%;
    border: 1px solid #0092CF;
  }

  .shutterCheckDiv {
    float: left;
    width: 20%;
    border: 1px solid #0092CF;
    height: 95%;
  }

  .fullWidth .el-checkbox {
    width: 100%;
  }

  .checked .el-checkbox {
    margin-left: 15px;
  }
</style>

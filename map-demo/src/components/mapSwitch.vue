<template>
  <div class="mapSwitch">
    <div class="mapSourceDiv">
      <span v-if="mapSource==0">数据来源：{{countryDataSource}}</span>
      <span v-if="mapSource==0">提供单位：{{countryDataProviter}}</span>
      <span v-if="mapSource!=0">数据来源：{{xmDataSource}}</span>
      <span v-if="mapSource!=0">提供单位：{{xmDataProviter}}</span>
      <span v-if="mapSource!=0">审图号：{{xmRegMapCode}}</span>
      <a target="_blank" href="http://www.cnzz.com/stat/website.php?web_id=1256970897">
        <img vspace="0" hspace="0" border="0" src="http://icon.cnzz.com/img/pic.gif"/></a>
      <span style="display: none">

      </span>
    </div>
    <div class="mapSwitchDiv  mapSwitchDiv-list-model">
      <a v-for="(map, index) in mapList" :key="map" v-if="map.istaglayer==0?true:false"
         class="maptype maptype-img"
         :style="'opacity:'+ index/10+'; background: #fff url(/static/img/mapSwitch/logo-'+map.mapnature+'.png) no-repeat center 0;background-size:60px;'"
         @click="XmMapSwitcher(map.id,map.mapnature)">
        <div class="maptype-label">{{map.name.replace("厦门市20","").replace("厦门","").replace("电子","")}}</div>
      </a>
      <!-- <a class="maptype maptype-detail other-maptype map-disabled" style="opacity: 0.1;">
         <div class="maptype-label">详细图</div>
       </a>
       <a class="maptype maptype-d25 other-maptype map-disabled"  style="opacity: 0.2;">
         <div class="maptype-label">2.5维地图</div>
       </a>
       <a class="maptype maptype-img60 other-maptype"  style="opacity: 0.3; display: inline;">
         <div class="maptype-label">60年代影像</div>
       </a>
       <a class="maptype maptype-img70 other-maptype"  style="opacity: 0.4; display: inline;">
         <div class="maptype-label">70年代影像</div>
       </a>
       <a class="maptype maptype-img2000 other-maptype" style="opacity: 0.5; display: inline;">
         <div class="maptype-label">2000年左右影像</div>
       </a>
       <a class="maptype maptype-dixing other-maptype map-disabled"  style="opacity: 0.6;">
         <div class="maptype-label">地形</div>
       </a>
       <a class="maptype maptype-img" style="opacity: 0.7;">
         <div class="maptype-label">影像</div>
       </a>-->
      <a class="maptype maptype-selected"
         :style="'opacity:1;background: #fff url(/static/img/mapSwitch/logo-'+bgImg+'.png) no-repeat center 0 /60px 60px;'">
        <div class="maptype-label">{{selected}}</div>
      </a>
    </div>
  </div>
</template>

<script>
  import {asmx} from '@/utils'
  import * as baseMapSwitch from '../utils/baseMapSwitch.js'
  import * as country from '@/api/esriLib/init'
  export default {
    name: 'mapSwitch',
    //模板
    components: {},
    data() {
      return {
        mapList: [],//厦门图层
        nodeList: [],//厦门注记图层
        currentMapId:1,//当前厦门的地图
        selected: "矢量地图", //选择样式
        bgImg: 1,
        countryMapList: [],//国家地图
        currentCountryNature:1,//国家当前的地图类型

        mapSource:-1,
      }
    },
    //默认
    props: {},
    filters: {},
    //初始化参数
    computed: {
      map(){
        return this.$store.state.map;
      },
      layer(){
        return this.$store.state.layer;
      },
      xmDataProviter(){
        let xm_dataprovider = this.$store.state.initSysConfig.xm_dataprovider;
        console.log("xm_dataprovider", xm_dataprovider);
        return xm_dataprovider;
      },
      xmDataSource(){
        let xm_datasourse = this.$store.state.initSysConfig.xm_datasourse;
        console.log("xm_datasourse", xm_datasourse);
        return xm_datasourse;
      },
      xmRegMapCode(){
        let xm_regmapcode = this.$store.state.initSysConfig.xm_regmapcode;
        console.log("xm_regmapcode", xm_regmapcode);
        return xm_regmapcode;
      },
      countryDataProviter(){
        let gj_dataprovider = this.$store.state.initSysConfig.gj_dataprovider;
        console.log("gj_dataprovider", gj_dataprovider);
        return gj_dataprovider;
      },
      countryDataSource(){
        let gj_datasourse = this.$store.state.initSysConfig.gj_datasourse;
        console.log("gj_datasourse", gj_datasourse);
        return gj_datasourse;
      },
    },
    watch: {},
    methods: {
      getMap() {
        let vm = this;

        vm.addCountryLayerToMap();

        //优化，一开始不全部加在到map内，只有当选择到改图层是再加到map内，后根据选择hide/show error 因为有多个底图公用一个主机图层
        asmx.post('getBaseMapPara').then(function (resp) {
          let layers = vm.map.getLayer("layer0");
          layers.hide();//隐藏外部多加的图层

          vm.mapList = vm.listSortBy(resp, 'publishYear', 'desc');
          vm.mapList = vm.listSortBy(vm.mapList, 'istaglayer', 'asc');

          Array.from(vm.mapList).forEach(function (layer) {
            if (layer.mapnature == 1) {
              let ly = new esri.layers.ArcGISTiledMapServiceLayer(layer.url);
              ly.id = layer.id;
              ly.show();
              vm.map.addLayer(ly);
            }
            if (layer.istaglayer == 1) {
              vm.nodeList.push({id: layer.id, nature: layer.mapnature});
            }
          });
        })
        vm.map.on("extent-change", vm.baseMapSwitch);
      },
      //时间排序
      listSortBy(arr, field, order) {
        let refer = [];
        let result = [];
        let index;
        order = order == 'asc' ? 'asc' : 'desc';
        for (let i = 0; i < arr.length; i++) {
          refer[i] = arr[i][field] + ':' + i;
        }
        refer.sort();
        if (order == 'desc') refer.reverse();
        for (let i = 0; i < refer.length; i++) {
          index = refer[i].split(':')[1];
          result[i] = arr[index];
        }
        return result;
      },
      /**
       * 厦门地图切换
       * @param id
       * @param mapNature
       */
      XmMapSwitcher(id, mapNature){
        let vm = this;
        //当前图层
        if(vm.currentMapId==id){
            return
        }else{
          vm.currentMapId=id
        }

        let layers = vm.map._layers;
        let checkLayer = vm.map.getLayer(id);
        let nodeId;
        Array.from(vm.nodeList).forEach(function (node) {
          if (node.nature == mapNature) {
            nodeId = node.id;
          }
        });
        let count=0;//统计时候是多个底图公用一个注记图层的
        Array.from(vm.mapList).forEach(function (layer) {
          if (layer.mapnature==mapNature) {
            count++;
          }
        });
        //控制显隐 ，要是之前存在的话
        for (let i = 0, l = layers.length; i < l; i++) {
          if (layers[i] != undefined) {
            layers[i].hide();
            if (layers[i].id == id || layers[i].id == nodeId) {//打开对应选择的底图 和注记图层
              layers[i].show();
            }
          }
        }
        if (checkLayer == null || checkLayer == undefined) {//之前没有的图层
          Array.from(vm.mapList).forEach(function (layer) {
            if (layer.mapnature == mapNature) {//可能多个底图配一个注记
              let ly = new esri.layers.ArcGISTiledMapServiceLayer(layer.url);
              ly.id = layer.id;
              ly.hide();
              if (layer.id == id || layer.id == nodeId) {
                ly.show();
              }
              vm.map.addLayer(ly);
            }
          });
        }
        vm.countryMapSwitcher(mapNature);
        //文字修改显示
        for (let i = 0; i < vm.mapList.length; i++) {
          if (vm.mapList[i].id == id) {
            vm.bgImg = vm.mapList[i].mapnature;
            vm.selected = vm.mapList[i].name.replace("厦门市20", "").replace("厦门", "").replace("电子", "");
          }
        }
      },
      /**
       * 国家地图的切换
       */
      countryMapSwitcher(mapNature){
        let vm = this;
        if(vm.currentCountryNature==mapNature){
            return;
        }else{
          vm.currentCountryNature=mapNature;
        }
        Array.from(vm.countryMapList).forEach(function (map) {
          map.hide();
          if (map.id == "country_" + mapNature || map.id == "country_node_" + mapNature) {
            map.show();
          }
        });
      },
      /**
       * 隐藏所有厦门的map
       */
      hideAllXmMap(){
        let vm = this;
        let layers = vm.map._layers;
        for (let i = 0, l = layers.length; i < l; i++) {
          if (layers[i] != undefined) {
            layers[i].hide();
          }
        }
      },
      /**
       * 隐藏所有的国家map
       */
      hideAllCountryMap(){
        let vm = this;
        Array.from(vm.countryMapList).forEach(function (map) {
          map.hide();
        });
      },
      /**
       * 恢复原先的国家地图显示
       */
      showCurrentCountMap(){
        let vm = this;
        Array.from(vm.countryMapList).forEach(function (map) {
          if (map.id == "country_" + vm.currentCountryNature || map.id == "country_node_" + vm.currentCountryNature) {
            map.show();
          }
        });
      },
      baseMapSwitch(e){
        let vm = this;
        let extent = e.extent;
        let postion = baseMapSwitch.CheckMapPosition(extent);
        vm.mapSource=postion;
        switch (postion) {
          //不在当前范围内：只显示国家级节点地图-由于不在当前范围内，厦门市节点切片不会被请求，即不会造成流量浪费，在此只需修改数据源标注
          case 0:
            //vm.hideAllXmMap();
            break;
          //完全在当前范围内：只显示厦门市级节点地图，隐藏掉所有的国家节点地图，节省流量，提高地图浏览的流畅度
          case 1:
            vm.hideAllCountryMap();
            break;
          //交叉：显示国家和厦门市级节点地图
          case 2:
            vm.showCurrentCountMap();
            break;
          default:
            break;
        }
      },
      /**
       * 添加国家layer
       * @param type
       */
      addCountryLayerToMap() {
        let vm = this;
        let countryMap;
        //矢量
        countryMap = new TdtVecWebTileLayer();  //矢量
        countryMap.id = "country_1";
        countryMap.show();
        vm.map.addLayer(countryMap);
        vm.countryMapList.push(countryMap);

        countryMap = new TdtCvaWebTileLayer();
        countryMap.id = "country_node_1";
        countryMap.show();
        vm.map.addLayer(countryMap);
        vm.countryMapList.push(countryMap);

        //影像
        countryMap = new TdtImgWebTileLayer();
        countryMap.id = "country_2";
        countryMap.hide();
        vm.map.addLayer(countryMap);
        vm.countryMapList.push(countryMap);

        countryMap = new TdtCiaWebTileLayer();
        countryMap.id = "country_node_2";
        countryMap.hide();
        vm.map.addLayer(countryMap);
        vm.countryMapList.push(countryMap);

        //晕眩
        countryMap = new TdtTerWebTileLayer();  //晕渲
        countryMap.id = "country_3";
        countryMap.hide();
        vm.map.addLayer(countryMap);
        vm.countryMapList.push(countryMap);

        countryMap = new TdtCtaWebTileLayer();
        countryMap.id = "country_node_3";
        countryMap.hide();
        vm.map.addLayer(countryMap);
        vm.countryMapList.push(countryMap);

      }
    },
    mounted() {
      this.getMap();
    }
  }

</script>
<style>
  .mapSwitch {
    right: 4px;
    bottom: 24px;
    display: inline-flex;
  }

  .mapSourceDiv {
    top: auto;
    bottom: 0px;
    position: absolute;
    z-index: 1004;
    left: 0px;
    font-size: 12px;
    background-color: rgba(255,255,255,0.8);
  }

  .mapSwitchDiv {
    top: auto;
    bottom: 30px;
    position: absolute;
    z-index: 1004;
    right: 20px;
    font-size: 12px
  }
  .mapSourceDiv span{
    margin-left: 10px;
    color: #565656;
  }
</style>
<style>
  .map-disabled,
  .map-disabled * {
    color: #aaa !important;
    background-color: #fff !important;
    cursor: default !important
  }

  .mapSwitchDiv a {
    text-align: center;
    cursor: pointer
  }

  .mapSwitchDiv .maptype {
    position: relative;
    float: left;
    padding-top: 35px;
    font-size: 12px;
    color: #333;
    box-shadow: 0 2px 8px rgba(0, 0, 0, .5), 0 -1px 0 rgba(0, 0, 0, .02)
  }

  .mapSwitchDiv .maptype-img {
    background-position: center -50px
  }

  .mapSwitchDiv .maptype .maptype-label {
    background-color: #fff;
    font-size: 13px;
    width: auto;
    min-width: 57px;
    padding: 2px .5em
  }

  .mapSwitchDiv .maptype-selected .maptype-label {
    display: none;
  }

  .mapSwitchDiv .maptype:hover .maptype-label {
    background-color: #5bb5e9;
    color: #fff;
    opacity: 1
  }

  .mapSwitchDiv .maptype-selected {
    position: absolute;
    display: block;
    right: 0;
    top: 105%;
    width: 0;
    height: 0;
    overflow: visible;
    border-width: 0;
    background: #fff url(/static/img/mapSwitch/logo-1.png) no-repeat center 0;
    background-size: 60px;
  }

  .mapSwitchDiv-list-model {
    padding: 6px 6px 6px 1px;
    -webkit-transition: background-color .3s ease-in-out;
    transition: background-color .3s ease-in-out
  }

  .mapSwitchDiv-list-model .maptype {
    position: relative;
    width: 2px;
    -webkit-transition: all .3s;
    transition: all .3s;
    white-space: nowrap;
    overflow: hidden;
    border: 1px solid #fff
  }

  .mapSwitchDiv-list-model .maptype-selected .maptype-label {
    display: block
  }

  .mapSwitchDiv-list-model:hover .maptype-selected .maptype-label {
    background-color: #3385ff;
    color: #fff
  }

  .mapSwitchDiv-list-model:hover {
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, .3), 0 -1px 0 rgba(0, 0, 0, .02)
  }

  .mapSwitchDiv-list-model:hover .maptype {
    width: auto;
    opacity: 1 !important;
    filter: alpha(opacity=100) !important;
    margin-left: 5px;
    border: 1px solid #c4c7cc
  }

  .mapSwitchDiv-list-model .maptype:hover {
    width: auto;
    min-width: 57px
  }

  .mapSwitchDiv-list-model .maptype-selected {
    text-indent: 0;
    width: auto;
    min-width: 57px;
    height: auto;
    cursor: default;
    opacity: 1 !important;
    -webkit-filter: none !important;
    filter: none !important
  }

</style>

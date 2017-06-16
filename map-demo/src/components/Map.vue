<template>
  <div id="map">{{msg}}</div>
</template>
<style scoped>
  body {
    background-color: #ff0000;
  }
</style>
<script>
  export default{
    name:'map',
    data(){
      return {
        msg: 'hello vue',
        map: null,
        layer: null,
        mapcenter:[0,0],
        maplevel:0,
        baselayers :[],
        domlayer:[],
      }
    },
    methods: {

      init: function () {
        //将国家天地图底图加载到地图控件中
        this.addLayerToMap();

        //将厦门市地图底图加载到地图控件中
        $.each(ssconfig.baselayers, function (i, baselayer) {
          this.addBaseLayerToMap(baselayer, true);
        });
        this.showLayer();
      },

      /*
       将厦门市地图底图服务添加到地图控件中
       */
      addBaseLayerToMap: function (baselayer, ishow) {
        //地图类型：0 切片地图  1矢量地图
        let ly;

        if (baselayer.maptype == 0) {
          ly = new esri.layers.ArcGISTiledMapServiceLayer(baselayer.url);
        } else {
          ly = new esri.layers.ArcGISDynamicMapServiceLayer(baselayer.url);
        }

        ly.id = baselayer.id + "_" + baselayer.name + "_" + baselayer.mapnature + "_" + baselayer.maptype;
        ly.visible = ishow;

        this.map.addLayer(ly);
      },

      /*
       将国家级天地图底图服务添加到地图控件中，默认不显示
       */
      addLayerToMap: function () {
        this.layer = this.initLayers();
        this.layer.id = "layer";
        this.layer.visible = false;

        this.map.addLayers(this.layer);
      },

      /*
       1. 根据地图范围显示国家节点地图服务
       2. 在地图类型切换和地图范围发生变化时执行此操作
       */
      showLayer: function () {
        this.layer.show();
      },

      /*
       国家和省级节点天地图数据
       */
      initLayers: function () {
        let layer= new esri.layers.TiledMapServiceLayer({
          spatialReference:new esri.SpatialReference({wkid: 4326}),
          initialExtent :new esri.geometry.Extent(-180.0,-90.0, 180.0, 90.0, this.spatialReference),
          loaded:true});//layer，在图层中添加面
        return layer;
      },

      /*
       隐藏所有的天地图地图 国家
       */
      hideAllTdtLayers: function () {
        this.layer.hide();
      },

      /*
       放大地图
       */
      zoomin: function () {
        let extent = this.map.extent;
        this.map.setExtent(extent.expand(0.5));
      },

      /*
       缩小地图
       */
      zoomout: function () {
        let extent = this.map.extent;
        this.map.setExtent(extent.expand(2));
      },
    },
    created(){
      let vm = this;
      getAjax("config/sysconfig.json").done(function (result) {
        vm.mapcenter = [parseFloat(result.mapcenter.split(',')[0]), parseFloat(result.mapcenter.split(',')[1])];
        vm.maplevel = parseInt(result.maplevel);
      });
      getAjax("config/baselayer.json").done(function (result) {
        for (var i = 0, l = result.length; i < l; i++) {
          var layer = result[i];
          if (layer.isshow == 1) {
            vm.baselayers.push(layer);
          }
          if (layer.mapnature == "2" && layer.istaglayer == "0") {
            vm.domlayer.push(layer);
          }
        }
      });
      this.map = new Map("map", {
        logo: false,
        slider: false,
        center: vm.mapcenter,
        zoom: vm.maplevel
      });
      //地图底图配置数据加载完毕，开始执行地图初始化操作
      this.init();
    },
  }
</script>

<template>
  <div class="measure" v-drag="{'dragElm':'move'}">
    <el-button size="mini" class="ion-arrow-move" ref="move"></el-button>
    <el-button-group class="btn-group">
      <el-button :class="lineAction?'icon el-icon-star-on':'icon el-icon-star-off'" @click="lineDrawInit()"><span class="text">长度测量</span></el-button>
      <el-button :class="dynamicAction?'icon el-icon-star-on':'icon el-icon-star-off'" @click="dynamicAreaDrawInit()"><span class="text">面积测量</span></el-button>
      <el-button class="icon-close el-icon-close" @click="handleClickBtn('close')"></el-button>
    </el-button-group>
  </div>
</template>
<style>
  .measure {
    position: fixed;
    right: 10px;
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
<script>
  import drag from '@/utils/drag'

  export default{
    name: "measure",
    data(){
      return {
        snapManager: null,
        measurement: null,
        /**
         *  样式
         */
        //样式，填充样式 面积
        areaSymbol: new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASH, new dojo.Color([255, 0, 0]), 2), new dojo.Color([102, 195, 255, 0.3])),
        //线样式
        lineSymbol: new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASH, new dojo.Color([255, 0, 0]), 2),
        //完成关闭样式
        closeSymbol: null,
        //点样式
        pointSymbol: new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 8, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 69, 0]), 2), new dojo.Color([255, 255, 255, 1])),
        //提醒样式
        textSymbol: null,

        spatialReference: new esri.SpatialReference({wkid: 4326}),//标识，固定
        /**
         * 根据用户鼠标点击绘图
         */
        dynamicPloygon: null,
        dynamicAGraphic: null,
        dynamicGraphicsLayer: null,
        dynamicMapClick: null,//dojo绑定的事件
        dynamicMapDbClick: null,//dojo绑定的事件
        dynamicMapMove:null,//dojo绑定的事件
        dynamicMapText: null,
        dynamicClickNum:0,
        dynamicTextAGraphic:[],
        dynamicPointAGraphic:[],
        dynamicLayerIds:[],//图层id
        dynamicAction:false,

        /**
         * 绘线
         */
        linePolyline: null,
        lineAGraphic: null,
        lineLayer: null,//
        lineDbClick: null,//双击事件
        lineClick: null,//单击事件
        lineMove: null,//移动事件
        lineClickNum: 0,//点击次数
        lineLength: 0,//长度
        lineTextAGraphic:[],//点击 点 的提示文本
        linePointAGraphic:[],//点 的图层
        lineLayerIds:[],//图层id
        lineAction:false,//是否图层操作
        /*
         *其他
         */
        tipDiv: null,
        movePoint:null,
      }
    },
    computed: {
      map(){
        return this.$store.state.map;
      },
      layer(){
        return this.$store.state.layer;
      }
    },
    directives: {drag},
    components: {},
    methods: {
      /**
       * 根据用户鼠标点击绘图
       */
      dynamicAreaDrawInit() {
        this.map.disableDoubleClickZoom();
        let vm = this;
        if(vm.lineAction)
          vm.removeNowAction();
        if (!vm.dynamicAction) {
          vm.dynamicAction=true;
          vm.dynamicMapClick = dojo.connect(vm.map, "onMouseDown", vm, "dynamicMouseClick");//dojo.connect为对象注册事件
          vm.dynamicMapMove = dojo.connect(vm.map, "onMouseMove", vm, "dynamicMouseMove");
          vm.dynamicMapDbClick = dojo.connect(vm.map, "onDblClick", vm, "dynamicMouseDBClick");

          vm.dynamicClickNum = 0;
          vm.dynamicPloygon = null;
          vm.dynamicAGraphic = null;
          vm.dynamicGraphicsLayer = null;
          vm.dynamicTextAGraphic = [];
          vm.dynamicPointAGraphic = [];
          vm.dynamicMapText = null;

          vm.movePoint=null;
        }
      },

      dynamicMouseDBClick(evt){
        evt = evt ? evt : (window.event ? window.event : null);
        let vm = this;
        vm.closeSymbol=vm.getCloseSymbol();
        let delGraphic = new esri.Graphic(evt.mapPoint, vm.closeSymbol);
        vm.dynamicGraphicsLayer.add(delGraphic);
        dojo.disconnect(vm.dynamicMapClick);//取消绑定
        dojo.disconnect(vm.dynamicMapMove);//取消绑定
        dojo.disconnect(vm.dynamicMapDbClick);//取消绑定
        vm.dynamicAction=false;//一次绘图操作结束
        vm.removeTipDiv();
        this.map.enableDoubleClickZoom();
      },

      dynamicMouseClick(evt) {
        let vm = this;
        evt = evt ? evt : (window.event ? window.event : null);
        //判断鼠标点击的按钮
        var btnNum = evt.button;
        if (btnNum == 0) {//鼠标左键 绘图
          vm.dynamicClickNum++;
          vm.dynamicAreaDraw(evt.mapPoint);
        } else if (btnNum == 1) {//滚轮键 回退
          vm.dynamicClickNum--;
          vm.dynamicAreaReturn();
        } else {
          //alert("您点击了" + btnNum + "号键，我不能确定它的名称。");
          return;
        }
      },

      dynamicMouseMove(evt){
        let vm = this;
        if (vm.dynamicClickNum == 0) {
          vm.mouseMoveShow(evt.clientX + 10, evt.clientY + 10, "单击确定起点");
        } else {
          /**
           * 绘点
           */
          if(vm.movePoint!=null) {
            vm.dynamicGraphicsLayer.remove(vm.movePoint);
          }
          vm.movePoint = new esri.Graphic(evt.mapPoint, vm.pointSymbol);
          vm.dynamicGraphicsLayer.add(vm.movePoint);
          /**
           * 文本注释
           */
          //加点
          vm.dynamicPloygon.insertPoint(0, vm.dynamicPloygon.rings[0].length - 1, evt.mapPoint);
          vm.dynamicAGraphic.setGeometry(vm.dynamicPloygon);
          //显示
          vm.mouseMoveShow(evt.clientX + 10, evt.clientY + 10, vm.getArea()+"<br/>单击确定地点，滚轮键回退，双击结束");
          //移除点
          vm.dynamicPloygon.removePoint(0, vm.dynamicPloygon.rings[0].length - 2);
        }
      },

      dynamicDrawEnd () {
        let vm = this;
        //清除点，隐藏layer
        for(let i=0;i<vm.dynamicLayerIds.length;i++){
          if(vm.map.getLayer(vm.dynamicLayerIds[i].id)) {
            document.getElementById(vm.dynamicLayerIds[i].id + "_layer").remove();
            vm.map.removeLayer(vm.map.getLayer(vm.dynamicLayerIds[i].id));
          }
        }
      },
      //绘图
      dynamicAreaDraw (pt) {
        let vm = this;
        //绘点部分
        let text = "起点";
        if (vm.dynamicPloygon == null) {//初始化 1、已有图层时 2、未有图层
          vm.dynamicPloygon = new esri.geometry.Polygon(vm.spatialReference);
          vm.dynamicPloygon.addRing([[pt.x, pt.y], [pt.x, pt.y]]);//添加点数据

          if (vm.dynamicGraphicsLayer == null) {
            vm.dynamicAGraphic = new esri.Graphic(vm.dynamicPloygon, vm.areaSymbol);//面，以点汇面

            let layerId="dynamicMap"+vm.dynamicLayerIds.length;
            vm.dynamicLayerIds.push({"id":layerId});
            vm.dynamicGraphicsLayer = new esri.layers.GraphicsLayer({id: layerId});//layer，在图层中添加面

            vm.dynamicGraphicsLayer.add(vm.dynamicAGraphic);

            vm.map.addLayer(vm.dynamicGraphicsLayer);

            dojo.connect(vm.dynamicGraphicsLayer, "onClick", this, "removeLayer");//图层加上触发事件
          }
        } else {//点击图中加点
          if (vm.dynamicPloygon.rings[0] == undefined || vm.dynamicPloygon.rings[0].length < 1) {//后退后再次重新绘点
            vm.dynamicPloygon.addRing([[pt.x, pt.y], [pt.x, pt.y]]);//添加点数据
          } else {
            vm.dynamicPloygon.insertPoint(0, vm.dynamicPloygon.rings[0].length - 1, pt);
          }
          vm.dynamicAGraphic.setGeometry(vm.dynamicPloygon);//vm._geoPloygon为一个array point数组，根据point数据绘制多边形
          text =vm.getArea();
        }
        //点
        vm.dynamicPointAGraphic.push(new esri.Graphic(pt, vm.pointSymbol));
        vm.dynamicGraphicsLayer.add(vm.dynamicPointAGraphic[vm.dynamicPointAGraphic.length-1]);
        //移除上一个点的标注
        if(vm.dynamicTextAGraphic.length>0)
          vm.dynamicGraphicsLayer.remove(vm.dynamicTextAGraphic[vm.dynamicTextAGraphic.length-1]);
        //点标注样式
        vm.textSymbol =vm.getTextSymbol(text);
        vm.dynamicTextAGraphic.push(new esri.Graphic(pt, vm.textSymbol));
        vm.dynamicGraphicsLayer.add(vm.dynamicTextAGraphic[vm.dynamicTextAGraphic.length-1]);
      },
      //回退点
      dynamicAreaReturn () {
        let vm = this;
        if (vm.dynamicPloygon.rings[0] == undefined || vm.dynamicPloygon.rings[0].length < 1) {//已无点时
          alert("已无回退点！");
        } else {
          if (vm.dynamicPloygon.rings[0].length <= 2) {//最后剩起始终止2个点时
              vm.dynamicPloygon.removeRing(0);
              vm.dynamicAGraphic.setGeometry(vm.dynamicPloygon);
          } else {//回退
            vm.dynamicPloygon.removePoint(0, vm.dynamicPloygon.rings[0].length - 2);
            vm.dynamicAGraphic.setGeometry(vm.dynamicPloygon);
          }
          /**
           * 移除当前点
           */
          //点
          vm.dynamicGraphicsLayer.remove(vm.dynamicTextAGraphic[vm.dynamicTextAGraphic.length - 1]);
          vm.dynamicTextAGraphic.splice(vm.dynamicTextAGraphic.length - 1, 1);
          //注释
          vm.dynamicGraphicsLayer.remove(vm.dynamicPointAGraphic[vm.dynamicPointAGraphic.length - 1]);
          vm.dynamicPointAGraphic.splice(vm.dynamicPointAGraphic.length - 1, 1);
          /**
           * 增加上一个点的注释
           */
          vm.dynamicGraphicsLayer.add(vm.dynamicTextAGraphic[vm.dynamicTextAGraphic.length - 1]);
        }
      },
      /*
       * 绘线
       */
      lineDrawInit() {
        this.map.disableDoubleClickZoom();
        let vm = this;
        if (vm.dynamicAction)
          vm.removeNowAction();
        if (!vm.lineAction) {
          vm.lineAction = true;
          vm.lineClick = dojo.connect(vm.map, "onMouseDown", vm, "lineMouseClick");
          vm.lineMove = dojo.connect(vm.map, "onMouseMove", vm, "lineMouseMove");
          vm.lineDbClick = dojo.connect(vm.map, "onDblClick", vm, "lineMouseDBClick");

          vm.lineClickNum = 0;
          vm.linePolyline = null;
          vm.lineAGraphic = null;
          vm.lineLayer = null;
          vm.lineLength = 0;
          vm.lineTextAGraphic = [];
          vm.linePointAGraphic = [];
          vm.movePoint = null;
        }
      },
      //鼠标双击事件
      lineMouseDBClick(evt){
        evt = evt ? evt : (window.event ? window.event : null);
        let vm = this;
        vm.closeSymbol=vm.getCloseSymbol();
        let delGraphic = new esri.Graphic(evt.mapPoint, vm.closeSymbol);
        vm.lineLayer.add(delGraphic);
        dojo.disconnect(vm.lineClick);//取消绑定
        dojo.disconnect(vm.lineMove);//取消绑定
        dojo.disconnect(vm.lineDbClick);//取消绑定
        vm.lineAction=false;//一次绘线操作结束
        vm.removeTipDiv();
        this.map.enableDoubleClickZoom();
      },
      //鼠标点击事件
      lineMouseClick (evt) {
        let vm = this;
        evt = evt ? evt : (window.event ? window.event : null);
        //判断鼠标点击的按钮
        var btnNum = evt.button;
        if (btnNum == 0) {//鼠标左键 绘图
          vm.lineClickNum++;
          vm.lineDraw(evt.mapPoint);
        } else if (btnNum == 1) {//滚轮键 回退
          vm.lineClickNum--;
          vm.lineDrawReturn();
        } else {
          //alert("您点击了无效按键。");
          return;
        }
      },
      //鼠标移动事件
      lineMouseMove (evt){
        let vm = this;
        if (vm.lineClickNum == 0) {
          vm.mouseMoveShow(evt.clientX + 10, evt.clientY + 10, "单击确定起点");
        } else {
          /**
           * 绘点
           */
          if(vm.movePoint!=null) {
            vm.lineLayer.remove(vm.movePoint);
          }
          vm.movePoint = new esri.Graphic(evt.mapPoint, vm.pointSymbol);
          vm.lineLayer.add(vm.movePoint);

          /**
           * 文本注释
           */
          //加点
          vm.linePolyline.insertPoint(0, vm.linePolyline.paths[0].length, evt.mapPoint);
          vm.lineAGraphic.setGeometry(vm.linePolyline);

          vm.lineLength = 0;
          for (let i = 0; i < vm.linePolyline.paths[0].length - 1; i++) {
            vm.lineLength += vm.getDistanceInEarth(vm.linePolyline.paths[0][i], vm.linePolyline.paths[0][i + 1]);
          }
          vm.lineLength < 1000 ? vm.mouseMoveShow(evt.clientX + 10, evt.clientY + 10, parseInt(this.lineLength) + "米<br/>单击确定地点，滚轮键回退，双击结束") : vm.mouseMoveShow(evt.clientX + 10, evt.clientY + 10, (vm.lineLength / 1000).toFixed(1) + "公里<br/>单击确定地点，滚轮键回退，双击结束");
          //移除点
          vm.linePolyline.removePoint(0, vm.linePolyline.paths[0].length - 1);
        }
      },
      //画线
      lineDraw (pt) {
        let vm = this;
        //绘点部分
        let text = "起点";
        //绘线部分
        if (vm.linePolyline == null) {//初始化 1、已有图层时 2、未有图层
          vm.linePolyline = new esri.geometry.Polyline(vm.spatialReference);
          vm.linePolyline.addPath([[pt.x, pt.y]]);//添加点数据

          if (vm.lineLayer == null) {
            vm.lineAGraphic = new esri.Graphic(vm.linePolyline, vm.lineSymbol);//面，以点汇面

            let layerId="lineLayer"+vm.lineLayerIds.length;
            vm.lineLayer = new esri.layers.GraphicsLayer({id: layerId});//layer，在图层中添加面

            vm.lineLayerIds.push({"id":layerId});

            vm.lineLayer.add(vm.lineAGraphic);

            vm.map.addLayer(vm.lineLayer);

            dojo.connect(vm.lineLayer, "onClick", this, "removeLayer");//图层加上触发事件
          }
        } else {//点击图中加点

          vm.linePolyline.insertPoint(0, vm.linePolyline.paths[0].length, pt);
          vm.lineLength = 0;
          for (let i = 0; i < vm.linePolyline.paths[0].length - 1; i++) {
            vm.lineLength += vm.getDistanceInEarth(vm.linePolyline.paths[0][i], vm.linePolyline.paths[0][i + 1]);
          }
          text = vm.lineLength < 1000 ? parseInt(vm.lineLength) + "米" : ((vm.lineLength) / 1000).toFixed(1) + "公里";
          if (vm.linePolyline.paths[0].length == 1)
             text = "起点";
          vm.lineAGraphic.setGeometry(vm.linePolyline);
        }
        //点
        vm.linePointAGraphic.push(new esri.Graphic(pt, vm.pointSymbol));
        vm.lineLayer.add(vm.linePointAGraphic[vm.linePointAGraphic.length-1]);
        //点标注样式
        vm.textSymbol = vm.getTextSymbol(text);
        vm.lineTextAGraphic.push(new esri.Graphic(pt, vm.textSymbol));
        vm.lineLayer.add(vm.lineTextAGraphic[vm.lineTextAGraphic.length-1]);
      },
      //画线结束
      lineDrawEnd () {
        let vm = this;
        for(let i=0;i<vm.lineLayerIds.length;i++){
            if(vm.map.getLayer(vm.lineLayerIds[i].id)) {
              document.getElementById(vm.lineLayerIds[i].id + "_layer").remove();
              vm.map.removeLayer(vm.map.getLayer(vm.lineLayerIds[i].id));
            }
        }
      },
      //点回退
      lineDrawReturn () {
        let vm = this;
        if (vm.linePolyline.paths[0] == undefined || vm.linePolyline.paths[0].length < 1) {//已无点时
          alert("已无回退点！");
        } else {//回退
          vm.linePolyline.removePoint(0, vm.linePolyline.paths[0].length - 1);//移除点 线
          vm.lineAGraphic.setGeometry(vm.linePolyline);

          vm.lineLayer.remove(vm.lineTextAGraphic[vm.lineTextAGraphic.length - 1]);//移除 点注释
          vm.lineTextAGraphic.splice(vm.lineTextAGraphic.length - 1, 1);//移除 点注释的对象

          vm.lineLayer.remove(vm.linePointAGraphic[vm.linePointAGraphic.length - 1]);//移除 点注释
          vm.linePointAGraphic.splice(vm.linePointAGraphic.length - 1, 1);//移除 点注释的对象
        }
      },

      //移除当前操作的图层，当绘线或者绘点的时候，没有双击结束，又切换到另一个
      removeNowAction(){
        let vm = this;
        if (vm.dynamicAction) {//当前未结束的是绘面
          document.getElementById(vm.dynamicGraphicsLayer.id+"_layer").remove();
          vm.map.removeLayer(vm.dynamicGraphicsLayer);

          dojo.disconnect(vm.dynamicMapClick);//取消绑定
          dojo.disconnect(vm.dynamicMapMove);//取消绑定
          dojo.disconnect(vm.dynamicMapDbClick);//取消绑定

          vm.dynamicMapClick = null;
          vm.dynamicMapMove = null;
          vm.dynamicMapDbClick = null;

          vm.dynamicClickNum = 0;
          vm.dynamicPloygon = null;
          vm.dynamicAGraphic = null;
          vm.dynamicGraphicsLayer = null;
          vm.dynamicTextAGraphic = [];
          vm.dynamicPointAGraphic = [];
          vm.dynamicMapText = null;
          vm.dynamicAction = false;
          vm.movePoint=null;
        }
        if (vm.lineAction) {//当前未结束的是绘线
          document.getElementById(vm.lineLayer.id+"_layer").remove();
          vm.map.removeLayer(vm.lineLayer);

          dojo.disconnect(vm.lineClick);
          dojo.disconnect(vm.lineMove);
          dojo.disconnect(vm.lineDbClick);
          vm.lineClick = null;
          vm.lineMove = null;
          vm.lineDbClick = null;

          vm.lineClickNum = 0;
          vm.linePolyline = null;
          vm.lineAGraphic = null;
          vm.lineLayer = null;
          vm.lineLength = 0;
          vm.lineTextAGraphic = [];
          vm.linePointAGraphic = [];
          vm.lineAction=false;
          vm.movePoint=null;
        }
      },
      //内置函数：删除选中的图形对象 长度，面积
      removeLayer(evt) {
        let vm = this;
        evt = evt ? evt : (window.event ? window.event : null);
        dojo.stopEvent(evt);
        let grap = evt.graphic;
        if (grap.symbol.isClearBtn == true) {
          //清理数据
          vm.map.removeLayer(vm.map.getLayer(evt.currentTarget.id.split('_')[0]));
          //直接dom删除掉节点
          evt.currentTarget.remove();
        }
      },
      //移除所有显示
      removeAll(){
        //清除div
        let vm = this;
        vm.removeNowAction();
        vm.lineDrawEnd();
        vm.dynamicDrawEnd();
        vm.removeTipDiv();
        this.map.enableDoubleClickZoom();
      },
      //移除tip
      removeTipDiv(){
        let div = document.getElementById("pointOutDiv");
        if (div) {
          div.parentNode.removeChild(div);
        }
      },

      //鼠标移动显示
      mouseMoveShow (x, y, label) {
        let vm = this;
        vm.tipDiv = document.getElementById("pointOutDiv");
        if (!vm.tipDiv) {
          vm.tipDiv = document.createElement("div");
          vm.tipDiv.id = "pointOutDiv";
          vm.tipDiv.style.position = "absolute";
          vm.tipDiv.style.height = "40px";
          vm.tipDiv.style.zIndex = 800;
          vm.tipDiv.style.left = x + "px";
          vm.tipDiv.style.right = "auto";
          vm.tipDiv.style.top = y + "px";
          vm.tipDiv.style.bottom = "auto";
          vm.tipDiv.innerHTML = "<span style='text-decoration:none;font-size:12px;color:#393939;display:inline-block;float;left;border:1px solid #33A1C9;background-color: white;'>" + label + "</span>";
          document.body.appendChild(vm.tipDiv);
        } else {
          vm.tipDiv.innerHTML = "<span style='text-decoration:none;font-size:12px;color:#393939;display:inline-block;float;left;border:1px solid #33A1C9;background-color: white;'>" + label + "</span>";
          vm.tipDiv.style.left = x + "px";
          vm.tipDiv.style.top = y + "px";
          vm.tipDiv.style.display = "block";
        }
      },
      //计算面积
      getArea(){
        let Area = esri.geometry.geodesicAreas([this.dynamicPloygon], esri.Units.SQUARE_METERS);
        let showWord = Area[0] < 0 ? -Area[0] : Area[0];
        showWord = showWord < 1000000 ? showWord < 10000 ? showWord.toFixed(2) + "平方米" : (showWord / 10000).toFixed(2) + "平方公顷" : (showWord / 1000000).toFixed(2) + "平方公里";
        return showWord;
      },
      //计算点之间的距离
      getDistanceInEarth(point1, point2) {
        let vm = this;
        let d = new Number(0);
        if (vm.spatialReference.wkid == "4326") {
          let latLength1 = Math.abs(vm.translateLonLatToDistance(point1[0], point2[1]).x - vm.translateLonLatToDistance(point2[0], point2[1]).x);
          let latLength2 = Math.abs(vm.translateLonLatToDistance(point1[0], point1[1]).x - vm.translateLonLatToDistance(point2[0], point1[1]).x);
          let lonLength = Math.abs(vm.translateLonLatToDistance(point1[0], point2[1]).y - vm.translateLonLatToDistance(point1[0], point1[1]).y);
          d = Math.sqrt(Math.pow(lonLength, 2) - Math.pow(Math.abs(latLength1 - latLength2) / 2, 2) + Math.pow(Math.abs(latLength1 - latLength2) / 2 + Math.min(latLength1, latLength2), 2));
        }
        else {
          let len_prj = Math.pow((point2.x - point1.x), 2) + Math.pow((point2.y - point1.y), 2);
          d = Math.sqrt(len_prj);
        }
        d = Math.ceil(d);
        return d;
      },
      translateLonLatToDistance(a, b) {
        let radPerDegree = Math.PI / 180.0;
        let equatorialCircumference = Math.PI * 2 * 6378137;

        return {
          x: Math.cos(b * radPerDegree) * equatorialCircumference * Math.abs(a / 360),
          y: equatorialCircumference * Math.abs(b / 360)
        };
      },
      //text symbol
      getTextSymbol(text){
        let fontColor = new dojo.Color('#696969');
        let holoColor = new dojo.Color('#fff');
        let font = new esri.symbol.Font('10pt', esri.symbol.Font.STYLE_ITALIC, esri.symbol.Font.VARIANT_NORMAL, esri.symbol.Font.WEIGHT_BOLD, 'Courier');
        let textSymbol = new esri.symbol.TextSymbol(text, font, fontColor);
        textSymbol.setOffset(10, 10).setHaloColor(holoColor).setHaloSize(2);
        textSymbol.setAlign(esri.symbol.TextSymbol.ALIGN_MIDDLE);
        return textSymbol;
      },
      //closeSymbol
      getCloseSymbol(){
        let iconPath = 'M13.618,2.397 C10.513,-0.708 5.482,-0.713 2.383,2.386 C-0.718,5.488 -0.715,10.517 2.392,13.622 C5.497,16.727 10.529,16.731 13.627,13.632 C16.727,10.533 16.724,5.502 13.618,2.397 L13.618,2.397 Z M9.615,11.351 L7.927,9.663 L6.239,11.351 C5.55,12.04 5.032,12.64 4.21,11.819 C3.39,10.998 3.987,10.48 4.679,9.79 L6.367,8.103 L4.679,6.415 C3.989,5.726 3.39,5.208 4.21,4.386 C5.032,3.566 5.55,4.165 6.239,4.855 L7.927,6.541 L9.615,4.855 C10.305,4.166 10.82,3.565 11.642,4.386 C12.464,5.208 11.865,5.726 11.175,6.415 L9.487,8.102 L11.175,9.789 C11.864,10.48 12.464,10.998 11.642,11.819 C10.822,12.64 10.305,12.04 9.615,11.351 L9.615,11.351 Z';
        let iconColor = '#b81b1b';
        let clearSymbol = new esri.symbol.SimpleMarkerSymbol();
        clearSymbol.setOffset(10, -10);
        clearSymbol.setPath(iconPath);
        clearSymbol.setColor(new dojo.Color(iconColor));
        clearSymbol.setOutline(null);
        clearSymbol.isClearBtn = true;
        return clearSymbol;
      },
      //other
      handleClickBtn(btn){
        switch (btn) {
          case 'close':
            this.removeAll();
            this.$emit('show', false);
            break;
          default:
            break;
        }
      },
      snapManager(){
        let vm = this;
        //dojo.keys.copyKey maps to CTRL on windows and Cmd on Mac., but has wrong code for Chrome on Mac
        vm.snapManager = map.enableSnapping({
          snapKey: has("mac") ? keys.META : keys.CTRL
        });
        let layerInfos = [{
          layer: vm.layer//a layer of map
        }];
        vm.snapManager.setLayerInfos(layerInfos);

        vm.measurement = new Measurement({
          map: vm.map//map
        }, dom.byId("measurementDiv"));
        vm.measurement.startup();
      },

    },
    mounted(){

    }
  }
</script>

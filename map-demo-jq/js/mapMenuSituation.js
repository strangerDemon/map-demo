/**
 * 地图按钮，人员分布
 * 地图的路线是已知的，根据map的level划分用户行程的段的划分
 */
var positionList=new Array();
var positionGraphic;
var positionLayer;
var pointPloygon;

var intervalId;

function getUserPositionSituation() {
    if(intervalId!=null) {
        clearPositionSituation();
        closeInterval();
    }else {
        /*intervalId=setInterval(ajaxGetData, 5000);*/
        initTest();
        intervalId = setInterval(doTest, 1000);
    }
}
function ajaxGetData(){
    socket.send("$00004AllClient");//所有人提交更新数据，应该是持久性的广播
    $.ajax({
        type: "GET", //访问WebService使用Post方式请求
        url: "http://www.ztgis.com:8883/xmtdt.asmx/getPoints?para={'Token':'" + token + "'}", //调用WebService
        dataType: 'json',
        success: function (result) {
            if (result == null || result == "null") {
                return;
            }
            if (result.Results == null || result.Results == "null") {//没有请求到列表数据，把列表隐藏
                return false;
            }
            positionList = result.Results;
            clearPositionSituation();
            drawPositionSituation();
        },
        error: function (result) {
            alert(result);
        }
    });
}
//测试动态实时绘制
function initTest(){
    for (var i = 0; i < 1000; i++) {
        positionList[i]=[118.10000,24.4937309384];
    }
}
function doTest() {
    for (var i = 0; i < 1000; i++) {
        positionList[i][0] = positionList[i][0] + Math.random() / 1000;//[24.4937309384,118.10000];
        positionList[i][1] = positionList[i][1] + Math.random() / 1000;
    }
    //console.log("1111");
    clearPositionSituation();
    drawPositionSituation();
}

//绘制人员分布
function drawPositionSituation() {
    //绘点
    if(positionLayer == undefined || positionLayer == null) {
        positionLayer = new esri.layers.GraphicsLayer({id: "mySituationMap"});//layer，在图层中添加面
        ssmap.map.addLayer(positionLayer);
    }
    for (var i = 0; i < positionList.length; i++) {
        var positionPoint = new esri.geometry.Point(parseFloat(positionList[i][0]), parseFloat(positionList[i][1]), new esri.SpatialReference({wkid: 4490}));

        positionGraphic = new esri.Graphic(positionPoint, new esri.symbol.PictureMarkerSymbol('images/myPosition.png', 8, 8));//面，以点汇面

        positionLayer.add(positionGraphic);
    }
    positionLayer.show();
    //绘线
    /*if (positionLayer == undefined || positionLayer == null) {
        pointPloygon = new esri.geometry.Polygon(new esri.SpatialReference({wkid: 4490}));
        // new esri.symbol.PictureMarkerSymbol('images/myPosition.png', 8, 8)
        //new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 160, 122]), 2)
        positionGraphic = new esri.Graphic(pointPloygon,new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 160, 122]), 2));//面，以点汇面
        positionLayer = new esri.layers.GraphicsLayer({id: "situationMap"});//layer，在图层中添加面
        positionLayer.add(positionGraphic);
        map.addLayer(positionLayer);
    }
    for (var i = 0; i < positionList.length; i++) {
        if (pointPloygon.rings[0] == undefined || pointPloygon.rings[0].length < 1) {//后退后再次重新绘点
            pointPloygon.addRing([[positionList[i][0], positionList[i][1]]]);//添加点数据
        } else {
            pointPloygon.insertPoint(0, pointPloygon.rings[0].length, {"x":positionList[i][0],"y":positionList[i][1]});
        }
    }
    positionGraphic.setGeometry(pointPloygon);
    //图层显示级别
    positionLayer.show();*/
}
//清理人员分布显示
function clearPositionSituation() {
    //清理绘点
    if(positionLayer != undefined && positionLayer != null ) {
        //positionLayer.graphics=[];
        positionLayer.clear();
        positionLayer.refresh();
    }
    //清理绘线
    if (pointPloygon!=null && pointPloygon.rings[0] != undefined && pointPloygon.rings[0].length >0) {
        pointPloygon.removeRing(0);
        positionGraphic.setGeometry(pointPloygon);
    }
}
/**
 * 关闭interval定时器
 */
function closeInterval(){
    if(intervalId!=null) {
        clearInterval(intervalId);
        intervalId=null;
    }
    socket.send("$00005AllClient");//所有人停止提交更新数据
}
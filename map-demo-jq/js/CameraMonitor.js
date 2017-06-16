/**
 * Created by Administrator on 2017/6/5.
 * 摄像头的监控器
 * 通过接口获取摄像头的位置，并在地图上绘制出来
 * 点击摄像头点控制调用摄像头
 */
//ajax 请求
//获取camera list 并显示在地图上
function ajaxCamereList() {
    return $.ajax({
        type: "GET", //访问WebService使用Post方式请求
        url: "http://www.ztgis.com:8883/xmtdt.asmx/getCamera?para={'Token':'" + token + "'}", //调用WebService
        dataType: 'json'
    });
}
var isShow=false;
//绘制摄像头点的位置
function drawCamerePoint(){
    ajaxCamereList().then(function (data) {
        var cameraList = data.Results;
        if (data == null || data.Results == null || data.Results.length == 0) {
            alert("未能查询到摄像头的数据！");
            return;
        }
        for (let i = 0; i < cameraList.length; i++) {
            var CameraPoint = new esri.geometry.Point(parseFloat(cameraList[i].Lng), parseFloat(cameraList[i].Lat), new esri.SpatialReference({wkid: 4490}));
            var CameraAGraphic = new esri.Graphic(CameraPoint, new esri.symbol.PictureMarkerSymbol('images/video.png', 16, 16));//面，以点汇面
            var CameraLayer= new esri.layers.GraphicsLayer({id: "cameraMap"+cameraList[i].Id});//layer，在图层中添加面
            //无论何时点击，都更新ssmap.map中的cameralayer图层
            ssmap.map.addLayer(CameraLayer);
            CameraLayer.add(CameraAGraphic);
            //只能在layer和map上加事件
            CameraLayer.on("click",function(){
                //camera事件
                window.caremaMonitor.init(cameraList[i]);
            });
            CameraLayer.on("mouse-over",function(){//内部不能用CameraLayer，会混乱，用this
                this.graphics[0].symbol= new esri.symbol.PictureMarkerSymbol('images/video.png', 32, 32);
                this.refresh();
            });
            CameraLayer.on("mouse-out",function(){
                this.graphics[0].symbol= new esri.symbol.PictureMarkerSymbol('images/video.png', 16,16);
                this.refresh();
            });

            //ssmap.map 根据当前的状态设置显隐
            if (isShow) {
                ssmap.map.getLayer("cameraMap" + cameraList[i].Id).hide();
            } else {
                ssmap.map.getLayer("cameraMap" + cameraList[i].Id).show();
            }
        }
        isShow=!isShow;
    });
}
//做成一个全局变量，而不是CameraLayer.on("click",function(){内的临时变量
$(function () {
    window.caremaMonitor=new Vue({
            el:"#camera",
            //变量
            data: {
                cameraData: null,
                isShow:false,
                iframeUrl:"",
            },
            //监视
            watch: {
                cameraData(){
                    console.log("camera:"+this.cameraData.Name);
                }
            },
            //方法
            methods: {
                init(cameraData){
                    this.cameraData=cameraData;
                    this.isShow=true;
                    //连接远程摄像头
                    this.$el.style="height:430px;width:800px;position: absolute;top: 80px;left: 10px;z-index: 999;";
                    var frames=document.getElementById("cameraIframe");
                    frames.contentWindow.setCameraList(this.cameraData.Id+"|"+this.cameraData.Name+"|"+this.cameraData.Url+"|"+this.cameraData.IsController+"|"+this.cameraData.DeviceSerial+
                    "|"+this.cameraData.ChannelNo);

                },
                close(){
                    this.isShow=false;
                    //关闭摄像头连接
                    // 赋值空，断开player的连接
                    /*this.$el.firstChild.outerHTML="<iframe src=\'CameraVision.html?title=&url=&isController=&deviceSerial=&channelNo="+
                        "\' style='width: 100%;height: 100%;background-color: #ffffff;'> </iframe>";*/
                }
            },
            //创建时
            mounted: function () {
                //this.init();
            },
    });
})
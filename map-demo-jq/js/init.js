dojo.require("esri.map");
dojo.require("esri.tasks.GeometryService");
dojo.require("esri.tasks.LengthsParameters");
dojo.require("esri.tasks.AreasAndLengthsParameters");
dojo.require("esri.InfoTemplate");
dojo.require("esri.tasks.IdentifyTask");
dojo.require("esri.tasks.IdentifyParameters");
dojo.require("esri.tasks.query");
dojo.require("esri.tasks.QueryTask");
dojo.require("esri.layers.TileInfo");
dojo.require("esri.layers.ArcGISDynamicMapServiceLayer");
dojo.require("esri.layers.TiledMapServiceLayer");
dojo.require("esri.geometry.Polyline");
dojo.require("esri.SpatialReference");
dojo.require("esri.symbols.PictureMarkerSymbol");
dojo.require("esri.symbols.SimpleMarkerSymbol");
dojo.require("esri.symbols.SimpleLineSymbol");
dojo.require("esri.symbols.SimpleFillSymbol");
dojo.require("esri.renderers.ClassBreaksRenderer");
dojo.require("esri.layers.FeatureLayer");
dojo.require("esri.renderers.SimpleRenderer");
dojo.require("esri.symbols.Font");
dojo.require("esri.symbols.TextSymbol");
dojo.require("esri.geometry.Multipoint");
dojo.require("esri.tasks.BufferParameters");
dojo.require("esri.dijit.Popup");
dojo.require("esri.dijit.PopupTemplate");
dojo.require("dojo.on");
dojo.require("dojo.parser");
dojo.require("dijit.registry");
dojo.require("dijit.Toolbar");
dojo.require("esri.toolbars.draw");
dojo.require("dijit.form.Button");
dojo.require("dojo.dom-style");
dojo.require("dijit.TooltipDialog");
dojo.require("dijit.popup");
dojo.require("esri.config");

//全局变量
var map;
var lastFunModel = "";
var routeGraphicsLayer;
window.pl;
var gpsxy = [];
var xys = [];
var dataIndex = 0;
window.socket;
window.token = "dGltZT0xNDc5Mzg1NjgyMzY0Jm51bT1TUTZJMyZhY2Nlc3NUb2tlbj10cFJBQ0dqOTdPSk1nZG5MUlllTVQzSVRoL090RDB6SSZ2ZXJzaW" +
    "9uPXYxLjAmYXBwSWQ9aW5pdCZwbGF0Zm9ybT1hbmRyb2lkJnBob25lVVVJRD01YjJkMjk1MzNkNmY0MzM2OGExNzJhNmRhMjk3ZGE1ZA==";
$(function () {
    var namespace = ["esri/map",
        "esri/layers/ArcGISTiledMapServiceLayer",
        "esri/toolbars/navigation",
        "esri/geometry/Point",
        "esri/geometry/Extent",
        "dojo/on",
        "dojo/parser",
        "dijit/registry",
        "dijit/Toolbar",
        "dijit/form/Button",
        "esri/dijit/OverviewMap",
        "esri/dijit/BasemapLayer",
        "dojo/number",
        "esri/InfoTemplate",
        "esri/layers/FeatureLayer",
        "esri/renderers/HeatmapRenderer",
        "dojo/domReady!"
    ];

    var highchartData = [-1, -1, -1, -1, -1, -1, -1, -1];//动态实时初始化数据

    require(namespace,
          function (Map, Tiled, Navigation, Point, Extent, on, parser, registry, Toolbar, Button, OverviewMap) {

              parser.parse();

              navToolbar = new Navigation(ssmap.map);
              dojo.connect(navToolbar, "onExtentHistoryChange", extentHistoryChangeHandler);
              function extentHistoryChangeHandler() {
              }
              //菜单条点击
              $(".map_btn").on("click", "ul li", function () {
                  var className = this.className.split("-")[2] * 1;//$(this).context.className.split("-")[2] * 1
                  switch (className) {
                      case 1:
                          ssutil.FullScreen();//全屏
                          break;
                      case 2:
                          ssutil.ShowDuiBiListDiv();//对比
                          break;
                      case 3:
                          navToolbar.deactivate();//清除放大和缩小按钮
                          ssutil.AllDel();//清楚标绘和测距数据
                          break;
                      case 4:
                          ssutil.ShowZhuanTiDiv();//专题图
                          break;
                      case 5:
                          ssutil.ShowSearchDiv();//搜索
                          break;
                      case 6:
                          ssutil.Measure(1);//量测
                          break;
                      case 7:
                          ssutil.Measure(2);//量测
                          break;
                      case 8:
                          ssutil.ShowDiTuDiv();//地图切换
                          break;
                      case 9:
                          ssutil.ShowBiaohuiDiv();//标绘
                          break;
                      case 10:
                          navToolbar.activate(Navigation.ZOOM_IN);//放大
                          break;
                      case 11:
                          navToolbar.activate(Navigation.ZOOM_OUT);//缩小
                          break;
                      case 12:
                          //定位用户当前的位置
                          ssmyPosition.init();
                          ssmyPosition.showGeolocation();
                          break;
                      default:
                          break;
                  }
              });

              routeGraphicsLayer = new esri.layers.GraphicsLayer();
              routeGraphicsLayer.id = "ssroute_layer";
              ssmap.map.addLayer(routeGraphicsLayer);

              pl = new esri.geometry.Polyline(new esri.SpatialReference({ wkid: 4326 }));
              var color = [127, 127, 255];
              var symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color(color), 5);
              var graphic = new esri.Graphic(pl, symbol);
              routeGraphicsLayer.add(graphic);
              pl.addPath(xys);

              //websocket
              var host = "ws://183.250.160.124:8888/";//183.250.160.124，192.168.1.100
              socket = new WebSocket(host);
              try {

                  socket.onopen = function (msg) {
                      $("btnConnect").disabled = true;
                      //alert("连接成功！");
                      //socket.send("$00004");
                  };

                  socket.onmessage = function (msg) {
                      if (typeof msg.data == "string") {
                          msg = msg.data;
                          //解析经纬度数据
                          var data = msg.split('$');
                          if (data.length > 1) {
                              for(var i=1;i<data.length;i++) { //经纬度坐标|心率|速度|步数 |步频|体温|配速|步幅
                                  if (data[i].indexOf("00006") == 0) {//正常的实时数据 00006118.115037,24.490596|61|0.0|0|0|37.0|52|68
                                      data[i]=data[i].substring(5);
                                      highchartData = data[i].split("|");//切割初始化数据
                                      var info = data[1].split('|');
                                      //
                                      if (info.length > 0) {
                                          var x = parseFloat(info[0].split(',')[0]);
                                          var y = parseFloat(info[0].split(',')[1]);
                                          var pnt = new esri.geometry.Point(x, y, new esri.SpatialReference({ wkid: 4490 }));
                                          //map.centerAndZoom(pnt, 20);

                                          pl.insertPoint(0, dataIndex, pnt);//
                                          dataIndex = dataIndex + 1;

                                          routeGraphicsLayer.clear();
                                          var color = [127, 127, 255];
                                          var symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color(color), 5);
                                          var graphic = new esri.Graphic(pl, symbol);
                                          routeGraphicsLayer.add(graphic);
                                      }
                                  } else if (data[i].indexOf("00004") == 0) {//异常数据 00004|userCode|118.115037,24.490596|61|0.0|0|0|37.0|52|68
                                      data[i]=data[i].substring(5);
                                      //highchartData = data[i].split("|");//单个的数据
                                      setAbNormalList(data[i]);
                                  }
                              }
                          }
                      }
                  };
                  socket.onclose = function (msg) {
                      socket.send("$00002");
                  };

              }
              catch (ex) {
                  log(ex);
              }
          });
    
    function showHistoricalTrack() {
        if (dataIndex >= gpsxy.length) {
            return;
        }
        var pnt = new esri.geometry.Point(gpsxy[dataIndex].x, gpsxy[dataIndex].y, new esri.SpatialReference({ wkid: 4490 }));
        map.centerAndZoom(pnt, 15);

        pl.insertPoint(0, dataIndex, pnt);
        dataIndex = dataIndex + 1;

        routeGraphicsLayer.clear();
        var color = [127, 127, 255];
        var symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color(color), 5);
        var graphic = new esri.Graphic(pl, symbol);
        routeGraphicsLayer.add(graphic);
        pl.addPath(xys);
    }
    //socket获取的实时数据，highchart按需获取
    function getHighChartData(num) {
        return highchartData[num];
    }
    
    //实时监测
    $("#btn_ssjc").click(function () {
        switchFunModel();
        lastFunModel = "ssjc";
        $(".divSSJC").show();
    });

    //人员分布
    $("#btn_ryfb").click(function () {
        //alert("在地图上展示人员的分布！");
        getUserPositionSituation();
    });

    //视频监测
    $("#btn_spjc").click(function(){
        switchFunModel();
        drawCamerePoint();
        lastFunModel = "camera";
        //$(".camera").show();
    });

    //异常监测
    $("#btn_ycjc").click(function () {
        switchFunModel();
        lastFunModel = "ycjc";
        $(".ycjc").show();
    });

    //实时统计
    $("#btn_sstj").click(function () {
        window.vm.$mount("#map-menu-statistics-table");
        switchFunModel();
        lastFunModel = "sstj";
        $(".sstj").show();
    });

    //赛况回顾
    $("#btn_skhg").click(function () {
        switchFunModel();
        if ($("#submenu_skhg").is(':hidden')) {
            $("#submenu_skhg").show();
        }
        else {
            $("#submenu_skhg").hide();
        }
    });

    //运动回放
    $("#btn_ydhf").click(function () {
        switchFunModel();
        lastFunModel = "ydhf";

        $("#ssjc_chaxun").show();
        //$(".ydhf").show();
        //$("#ssjc_tongji").show();

        $("#submenu_skhg").hide();
    });

    //总体统计
    $("#btn_zttj").click(function () {
        switchFunModel();
        lastFunModel = "zttj";
        $(".zttj").show();

        $("#submenu_skhg").hide();
    });

    //三维赛道
    $("#btn_swsd").click(function () {
        alert("在地图上展示三维赛道！");
    });

    function switchFunModel() {
        if (lastFunModel == "") {
            return;
        }
        clearMonitor();
        if (lastFunModel == "ydhf") {
            $("#ssjc_chaxun").hide();
            $(".ydhf").hide();
            $(".ssjc").hide();
            $("#ssjc_tongji").hide();
        } else {
            $("." + lastFunModel).hide();
        }
    }

    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });
    function activeLastPointToolip(chart) {
        var points = chart.series[0].points;
        chart.tooltip.refresh(points[points.length - 1]);
    }
    //实时的highchart config
    //和websocket组合使用
    function getRealTimeChartConfig(name, num) {
        var config = {
            chart: {
                type: 'spline',
                animation: Highcharts.svg, // don't animate in old IE
                marginRight: 10,
                events: {
                    load: function () {
                        // set up the updating of the chart each second
                        var series = this.series[0],
                            chart = this;
                        setInterval(function () {
                            var x = (new Date()).getTime(), // current time
                                y = parseFloat(getHighChartData(num));//Math.random();
                            if(y!=-1) {
                                series.addPoint([x, y], true, true);
                                activeLastPointToolip(chart)
                            }
                        }, 1000);
                    }
                }
            },
            title: {
                text: name + '实时数据'
            },
            xAxis: {
                type: 'datetime',
                tickPixelInterval: 150
            },
            yAxis: {
                title: {
                    text: name
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                formatter: function () {
                    return Highcharts.numberFormat(this.y, 2);
                }
            },
            legend: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            exporting: {
                enabled: false
            },
            series: [{
                name: name,
                data: (function () {
                    // generate an array of random data
                    var data = [],
                        time = (new Date()).getTime(),
                        i;
                    for (i = -19; i <= 0; i += 1) {
                        data.push({
                            x: time + i * 1000,
                            y: 0
                        });
                    }
                    return data;
                }())
            }]
        };

        return config;
    }


    $('#ssjc_xl').highcharts(getRealTimeChartConfig('心率', 1), function (c) {
        activeLastPointToolip(c)
    });
    $('#ssjc_sd').highcharts(getRealTimeChartConfig('速度', 2), function (c) {
        activeLastPointToolip(c)
    });
    $('#ssjc_bp').highcharts(getRealTimeChartConfig('步频', 4), function (c) {
        activeLastPointToolip(c)
    });
    $('#ssjc_tw').highcharts(getRealTimeChartConfig('体温', 5), function (c) {
        activeLastPointToolip(c)
    });
    $('#ssjc_ps').highcharts(getRealTimeChartConfig('配速', 6), function (c) {
        activeLastPointToolip(c)
    });
    $('#ssjc_bf').highcharts(getRealTimeChartConfig('步幅', 7), function (c) {
        activeLastPointToolip(c)
    });


   /* $('#divtjfx').highcharts(getTJChartConfig('马拉松运动员行程统计','行程',[
        ['0 - 5km', 566],
        ['5 - 10km', 795],
        ['10 - 15km', 450],
        ['20 - 25km', 1200],
        ['30 - 35km', 300],
        ['40 - 5km', 800],
        ['40 - 42.195km', 100]
    ]));*/

    $('#divsktj').highcharts(getTJChartConfig('马拉松赛况统计', '时间',[
        ['2:00 - 2:10', 1],
        ['2:10 - 2:20', 2],
        ['2:20 - 2:30', 5],
        ['2:30 - 2:40', 10],
        ['2:40 - 2:50', 30],
        ['2:50 - 3:00', 80],
        ['2:50 - 3:00', 80],
        ['3:00 - 3:10', 500],
        ['3:10 - 3:20', 1000],
        ['3:20 - 3:40', 800],
        ['3:40 - 4:00', 500],
        ['4:00 - 4:20', 260],
        ['4:20 - 4:40', 200],
        ['4:40 - 5:00', 120]
    ]));
})

//统计，人的highchart，单独自己使用
function getTJChartConfig(title,name,data){
    var config={
        chart: {
            type: 'column'
        },
        title: {
            text: title
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'category',
            labels: {
                rotation: -45,
                style: {
                    fontSize: '13px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: '人数'
            }
        },
        legend: {
            enabled: false
        },
        tooltip: {
            pointFormat: '<b>{point.y} 人</b>'
        },
        credits: {
            enabled: false
        },
        series: [{
            name: name,
            data: data,
            dataLabels: {
                enabled: true,
                rotation: -90,
                color: '#FFFFFF',
                align: 'right',
                format: '{point.y:}', // one decimal
                y: 10, // 10 pixels down from the top
                style: {
                    fontSize: '13px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        }]
    }
    return config;
}

/**
  * id 筛选
  * attr 属性
  * value 赋值
  * num 筛选的第几个（可能筛选出多个）
  */
function setAttr(id, attr, value, num) {
    if ($(id) != null) {
        if (num == null) {
            $(id).attr(attr, value);
        } else {
            $(id + ":eq(" + num + ")").attr(attr, value);
        }
    }
}

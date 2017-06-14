/*
1. 系统初始化
2. 地图分享内容查阅
3. 系统访问日志记录
4. 地图类型切换
5. 地图纠错
6. 当前用户定位
7. 地图放大/缩小
*/
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

var dojoConfig = {
    paths: {
        extras: location.pathname.replace(/\/[^/]+$/, "") + "/extras"
    }
};

var ssmap = function () {
}

/*
    Vec 矢量
    Cva 矢量注记
    Img 影像
    Cia 影像注记
    Ter 晕渲
    Cta 晕渲注记
*/
//以下为静态全局变量
ssmap.map = undefined;
ssmap.tdt_vec = undefined;  //矢量
ssmap.tdt_cva = undefined;  //
ssmap.tdt_img = undefined;  //影像
ssmap.tdt_cia = undefined;  //
ssmap.tdt_ter = undefined;  //晕渲
ssmap.tdt_cta = undefined;

ssmap.init = function () {
    //将国家天地图底图加载到地图控件中
    ssmap.addTDTLayerToMap();

    //将厦门市地图底图加载到地图控件中
    $.each(ssconfig.baselayers, function (i, baselayer) {
        ssmap.addBaseLayerToMap(baselayer, true);
    });
    ssmap.showTdtLayer();
}


/*
    将厦门市地图底图服务添加到地图控件中
*/
ssmap.addBaseLayerToMap = function (baselayer, ishow) {
    //地图类型：0 切片地图  1矢量地图
    var ly;

    if (baselayer.maptype == 0) {
        ly = new esri.layers.ArcGISTiledMapServiceLayer(baselayer.url);
    } else {
        ly = new esri.layers.ArcGISDynamicMapServiceLayer(baselayer.url);
    }

    ly.id = baselayer.id + "_" + baselayer.name + "_" + baselayer.mapnature + "_" + baselayer.maptype;
    ly.visible = ishow;

    ssmap.map.addLayer(ly);
}

/*
    将国家级天地图底图服务添加到地图控件中，默认不显示
*/
ssmap.addTDTLayerToMap = function () {
    ssmap.tdt_vec = new TdtVecWebTileLayer();
    ssmap.tdt_vec.id = "vec_tdt";
    ssmap.tdt_vec.visible = false;

    ssmap.map.addLayers(ssmap.tdt_vec);
}

/*
    1. 根据地图范围显示国家节点地图服务
    2. 在地图类型切换和地图范围发生变化时执行此操作
*/
ssmap.showTdtLayer = function () {
    ssmap.tdt_vec.show();
}

/*
    国家和省级节点天地图数据
*/
ssmap.initTDTlLayers = function () {
    /*
        国家矢量地图服务
    */
    dojo.declare("TdtVecWebTileLayer", esri.layers.TiledMapServiceLayer, {
        constructor: function () {
            this.spatialReference = new esri.SpatialReference({ wkid: 4326 });
            this.initialExtent = (this.fullExtent = new esri.geometry.Extent(-180.0,
                -90.0, 180.0, 90.0, this.spatialReference));
            this.tileInfo = new esri.layers.TileInfo(ssconfig.tileinfo);

            this.loaded = true;
            this.onLoad(this);
        },

        getTileUrl: function (level, row, col) {
            return "http://t" + row % 8 + ".tianditu.cn/vec_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=c&TILEMATRIX=" + level + "&TILEROW=" + row + "&TILECOL=" + col + "&FORMAT=tiles";
        }
    });

}

/*
    隐藏所有的天地图地图 国家
*/
ssmap.hideAllTdtLayers = function () {
    ssmap.tdt_vec.hide();
}

/*
    放大地图
*/
ssmap.zoomin = function () {
    var extent = ssmap.map.extent;
    ssmap.map.setExtent(extent.expand(0.5));
}

/*
    缩小地图
*/
ssmap.zoomout = function () {
    var extent = ssmap.map.extent;
    ssmap.map.setExtent(extent.expand(2));
}

/*
    页面加载完成后执行的操作
*/
var ClusterLayer;
var ClassBreaksRenderer;
var FeatureLayer;
var SimpleRenderer;

$(document).ready(function () {
    require(["esri/map",
        "esri/layers/TiledMapServiceLayer",
        "extras/ClusterLayer",
        "esri/layers/FeatureLayer",
        "esri/renderers/ClassBreaksRenderer",
        "esri/renderers/SimpleRenderer",
        "dojo/domReady!"], function (Map, Tiled, _ClusterLayer, _FeatureLayer, _ClassBreaksRenderer, _SimpleRenderer) {
        ClusterLayer = _ClusterLayer;
        FeatureLayer = _FeatureLayer;
        ClassBreaksRenderer = _ClassBreaksRenderer;
        SimpleRenderer = _SimpleRenderer;
        ssmap.map = new Map("map", {
            logo: false,
            slider: false,
            center: ssconfig.mapcenter,
            zoom: ssconfig.maplevel
        });

        //构建国家、福建省切片地图服务类以及水印图层类
        ssmap.initTDTlLayers();

        //地图底图配置数据加载完毕，开始执行地图初始化操作
        ssmap.init();
    });

});

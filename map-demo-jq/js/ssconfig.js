/*
1. 存储配置文件
2. 配置文件解析
*/

/*
    应用程序全局操作类
*/
var ssconfig = function () {
    this.test = "test";//非静态私有变量
}

//以下为静态全局变量
ssconfig.mapcenter = "";//地图中心点
ssconfig.maplevel = "";//地图初始化切片级别
ssconfig.systitle = "";//系统名称
ssconfig.mapfullextent = "";//地图全图范围
ssconfig.xm_dataprovider = "";//厦门数据提供者
ssconfig.xm_datasourse = "";//厦门数据来源
ssconfig.xm_regmapcode = "";//厦门地图审图号
ssconfig.gj_dataprovider = "";//国家地图底图数据提供者
ssconfig.gj_datasourse = "";//国家地图底图数据来源
ssconfig.baselayers = []; //地图底图列表
ssconfig.interatedQuery = "";//综合查询配置
ssconfig.district = [];//政区定位配置
ssconfig.catagoryQuery = undefined;//分类查询配置
ssconfig.mapcontrast = []; //地图配置
ssconfig.domlayer = [];
ssconfig.ssthematicmap = []; //专题地图配置


//缓存切片信息-用于加载国家天地图数据
ssconfig.tileinfo = {
    "rows": 256,
    "cols": 256,
    "compressionQuality": 0,
    "origin": {
        "x": -180,
        "y": 90
    },
    "spatialReference": {
        "wkid": 4326
    },
    "lods": [
        { "level": 1, "resolution": 0.703125, "scale": 295497593.05875003 },
        { "level": 2, "resolution": 0.3515625, "scale": 147748796.52937502 },
        { "level": 3, "resolution": 0.17578125, "scale": 73874398.264687508 },
        { "level": 4, "resolution": 0.087890625, "scale": 36937199.132343754 },
        { "level": 5, "resolution": 0.0439453125, "scale": 18468599.566171877 },
        { "level": 6, "resolution": 0.02197265625, "scale": 9234299.7830859385 },
        { "level": 7, "resolution": 0.010986328125, "scale": 4617149.8915429693 },
        { "level": 8, "resolution": 0.0054931640625, "scale": 2308574.9457714846 },
        { "level": 9, "resolution": 0.00274658203125, "scale": 1154287.4728857423 },
        { "level": 10, "resolution": 0.001373291015625, "scale": 577143.73644287116 },
        { "level": 11, "resolution": 0.0006866455078125, "scale": 288571.86822143558 },
        { "level": 12, "resolution": 0.00034332275390625, "scale": 144285.93411071779 },
        { "level": 13, "resolution": 0.000171661376953125, "scale": 72142.967055358895 },
        { "level": 14, "resolution": 8.58306884765625e-005, "scale": 36071.483527679447 },
        { "level": 15, "resolution": 4.291534423828125e-005, "scale": 18035.741763839724 },
        { "level": 16, "resolution": 2.1457672119140625e-005, "scale": 9017.8708819198619 },
        { "level": 17, "resolution": 1.0728836059570313e-005, "scale": 4508.9354409599309 },
        { "level": 18, "resolution": 5.3644180297851563e-006, "scale": 2254.4677204799655 },
        { "level": 19, "resolution": 2.682209014892578E-6, "scale": 1127.2338602399827 },
        { "level": 20, "resolution": 1.341104507446289E-6, "scale": 563.61693011999137 }
    ]
};

//非静态私有函数
ssconfig.prototype.test = function () {

}

/*
    页面初始化时加载的参数
    1. 系统配置
    2. 地图底图
*/
window.getAjax = function (url) {
    var d = $.ajax({
        type: "GET",
        url: url,
        async: false,
        dataType: "json",
        cache: false
    });
    d.fail(function () { console.log(url + "加载出错！"); });
    return d
}

$(document).ready(function () {
    ssconfig.init();
});

ssconfig.init = function () {
    getAjax("dataconfig/sysconfig.json").done(function (result) {
        ssconfig.mapcenter = [parseFloat(result.mapcenter.split(',')[0]), parseFloat(result.mapcenter.split(',')[1])];
        ssconfig.maplevel = parseInt(result.maplevel);
        ssconfig.systitle = result.systitle;
        ssconfig.mapfullextent = result.mapfullextent;
        ssconfig.xm_dataprovider = result.xm_dataprovider;//厦门数据提供者
        ssconfig.xm_datasourse = result.xm_datasourse;//厦门数据来源
        ssconfig.xm_regmapcode = result.xm_regmapcode;//厦门地图审图号
        ssconfig.gj_dataprovider = result.gj_dataprovider;//国家地图底图数据提供者
        ssconfig.gj_datasourse = result.gj_datasourse;//国家地图底图数据来源
    });
    getAjax("dataconfig/baselayer.json").done(function (result) {
        for (var i = 0, l = result.length; i < l; i++) {
            var layer = result[i];
            if (layer.isshow == 1) {
                ssconfig.baselayers.push(layer);
            }
            if (layer.mapnature == "2" && layer.istaglayer == "0") {
                ssconfig.domlayer.push(layer);
            }
        }
    });
}

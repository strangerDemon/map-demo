/**
 * 地图按钮 ：实时监测
 * 只做分页上的一些显示处理
 */
window.userList = {};//数据源列表
var totalCount=0;//数据总量
var totalPageNum = 0;//所有的页数
var currentPageIndex = 1;//当前选择的页数：从1开始
var pageSize=20;//每页的大小
var lastMlsData;
//对地图的操作
var lng;//精度
var lat;//纬度
var myPositionPoint;
var mypositionAGraphic;//面，以点汇面
var myPositionLayer;//layer，在图层中添加面

var lastUserCode;
window.result;
//数据库获取运动员信息列表
$(function () {
    $("#imgSearch").click(function () {
        getUserListByCodeOrName();
    });
    $('#txtSearch').bind('keypress', function (event) {
        if (event.keyCode == 13) {//回车事件
            getUserListByCodeOrName()
        }
    });
    //隐藏
    $(".divCloseSSJC_DATA").click(function () {
        hideTongji();
    });
    //显示
    $(".divOpenSSJC_DATA").click(function () {
        showTongji();
    });
});
//将api请求提取出来，外部也有使用
function ApiRequest(txt){
    $.ajax({
        type: "GET", //访问WebService使用Post方式请求www.ztgis.com:8883
        url: "http://www.ztgis.com:8883/xmtdt.asmx/getUserListByCodeOrName?para={'Token':'" + token + "','keyword':'" + txt + "'}", //调用WebService
        //data: { "para": { 'Token': token, 'keyword': txt } },
        dataType: 'json',
        async: false,
        success: function (result) {
            window.result=result;
        },
        error: function (result) {
            alert(result);
            window.result= null;
        }
    });
}
//请求数据
//实时监测的人员请求
function getUserListByCodeOrName() {
    var txt = $("#txtSearch").val();//还要做处理
    if (txt != null && txt != "") {
        ApiRequest(txt);
        if (result == null || result == "null") {
            return;
        }
        if (result.Results == null || result.Results == "null") {//没有请求到列表数据，把列表隐藏
            $("#ssjc_athletes").hide();//列表隐藏
            setAttr("#ssjc_yundongyuan", "style", "display:none;");//隐藏卡片
            setAttr("#ssjc_tongji", "style", "display:none;");//隐藏统计
            $("#txtInputText").html('"' + txt + '"');
            $("#ssjc_divNoData").show();
            return false;
        }
        totalCount = result.Results.length;//列表有几条数据
        userList = result.Results;//列表
        //获取列表
        $("#ssjc_athletes").show();
        $("#ssjc_divNoData").hide();

        totalPageNum = Math.ceil(totalCount / pageSize);//所有的页数

        buildDataPager();
        loadPage(1);


    }
}
function getUserLastMlsData(userCode,index) {
    $.ajax({
        type: "GET", //访问WebService使用Post方式请求www.ztgis.com:8883
        url: "http://www.ztgis.com:8883/xmtdt.asmx/getUserLastMlsData?para={'Token':'" + token + "','userCode':'" + userCode + "'}", //调用WebService
        dataType: 'json',
        success: function (result) {
            lastMlsData = result.Results;//列表
            var distance = lastMlsData == null ? 0 + ' m' : lastMlsData.Distance >= 1000 ? lastMlsData.Distance / 1000 + ' km' : lastMlsData.Distance + ' m';
            $("#mlsDistance").html('行程：'+distance);
        },
        error: function (result) {
            alert(result);
        }
    });
}
//加载数据列表
/**
 *直接通过页码跳转
 */
function loadPage(pagerNum) {
    currentPageIndex = pagerNum;
    loadData();
}

/**
 *上一页
 */
function prePage() {
    if (currentPageIndex == 1) {//当前页是第一页
        return;
    }
    currentPageIndex--;
    loadData();
}
/**
 *下一页
 */
function nextPage() {
    if (currentPageIndex == totalPageNum) {//当前页是最后一页
        return;
    }
    currentPageIndex++;
    loadData();
}
/**
 *第一页
 */
function firstPage() {
    if (currentPageIndex == 1) {//当前页是第一页
        return;
    }
    currentPageIndex = 1;
    loadData();
}
/**
 *最后一页
 */
function lastPage() {
    if (currentPageIndex == totalPageNum) {//当前页是最后一页
        return;
    }
    currentPageIndex = totalPageNum;
    loadData();
}
/**
 * 加载数据
 */
function loadData() {
    var strHtml = "";

    var index = 1;
    var start = (currentPageIndex - 1) * pageSize;
    var end = currentPageIndex * pageSize > totalCount ? totalCount : pageSize * currentPageIndex;
    for (start; start < end; start++) {
        if (index % 2 == 1) {
            strHtml += '<div  onclick="itemClick(' + start + ')" class="item "><span class="txt">' + userList[start].Name + '</span></div>';
        } else {
            strHtml += '<div  onclick="itemClick(' + start + ')" class="item"><span class="txt">' + userList[start].Name + '</span></div>';
        }
        index = index + 1;
    }
    $("#searchResultItems").empty();

    $("#searchResultItems").append(strHtml);
    buildDataPager();
}
/**
 *加载脚页
 */
function buildDataPager() {
  
    var strBeginHtml = '<div class="divPager homePage" onclick="firstPage()">首页</div>';
    strBeginHtml += '<div class="divPager prePage"  onclick="prePage()">上一页</div>';

    var strEndHtml = '<div class="divPager nextPage"  onclick="nextPage()">下一页</div>';
    strEndHtml += '<div class="divPager lastPage" onclick="lastPage()">末页</div>';

    //开始构建分页组件html
    var strHtml = "";

    if (totalPageNum <= 5) {//中共小于等于5页时
        for (var i = 1; i <= totalPageNum; i++) {
            if (currentPageIndex == i) {
                strHtml += '<div class="divPager num" style="color:#ffffff;" onclick=loadPage(' + i + ')>' + i + '</div>';
            } else {
                strHtml += '<div class="divPager num" onclick=loadPage(' + i + ')>' + i + '</div>';
            }
        }
    } else {//多余5页时
        var startPage = currentPageIndex - 2 >= 1 ? currentPageIndex - 2 : 1;//当前分页组件开始页码
        var endPage = currentPageIndex + 2 <= totalPageNum ? currentPageIndex + 2 : totalPageNum;//当前分页组件结束页码
        if (totalPageNum >= 5 && endPage - startPage < 5) {//20页，当前页为19
            if (startPage == 1) { endPage = startPage + 4; }//下触底
            if (endPage == totalPageNum) { startPage = endPage - 4;}//上触底
        }
        for (var i = startPage; i <= endPage; i++) {
            if (currentPageIndex == i) {
                strHtml += '<div class="divPager num" style="color:#ffffff;" onclick=loadPage(' + i + ')>' + i + '</div>';
            } else {
                strHtml += '<div class="divPager num" onclick=loadPage(' + i + ')>' + i + '</div>';
            }
        }
    }
    
    $("#divPager").empty();

    $("#divPager").append(strBeginHtml);
    $("#divPager").append(strHtml);
    $("#divPager").append(strEndHtml);
}
/**
 * 当点击一条记录的时候
 */
function itemClick(index) {
    clearMonitor();//第二次点击的时候先清理第一个人的地位
    if (lastFunModel == "ssjc") {
        getUserLastMlsData(userList[index].Code);
        loadSSJCUser(index);
    } else if (lastFunModel == "ydhf") {
        loadYDHFUser(index);
    }
}
//加载实时监测的用户卡片
function loadSSJCUser(index){
    var sex = userList[index].Sex == 1 ? "男" : "女";
    var distance =lastMlsData==null?0+' m':lastMlsData.Distance >= 1000 ? lastMlsData.Distance / 1000 + ' km' : lastMlsData.Distance + ' m';
    var itemStr = '<div class="map-user-box">' +
        //javascript:socketSend(\'$00002\')
        '<div class="map-user-close"><a href="javascript:setAttr(\'#ssjc_yundongyuan\',\'style\',\'display:none;\');' +
        'javascript:setAttr(\'#ssjc_tongji\',\'style\',\'display:none;\');javascript:clearMonitor();">' +
        '<img src="images/map-user-close.png" width="20" height="20" /></a></div>' +
        '<div class="map-user-head">'+
        '<div class="map-user-img"><img src="images/photos/' + userList[index].Photo + '" width="66" height="66" style="box-shadow: 1px 1px 13px #8A8888;" /></div>' +
        '<div class="map-user-id"><a href="#"></a>ID：' + userList[index].Code + '</div>' +
        '</div>'+

        '<div class="map-user-txt">'+
        '<table width="100%" border="0" cellspacing="0" cellpadding="0">'+
        '<tbody>'+
        '<tr>'+
        '<td width="50%" height="29">姓名：' + userList[index].Name + '</td>' +
        '<td height="29">性别：' + sex + '</td>' +
        '</tr>'+
        '<tr>'+
        '<td width="50%" height="29" id="mlsDistance">行程：' + distance + '</td>' +
        '<td height="29">&nbsp;</td>'+
        '</tr>'+
        '</tbody>'+
        '</table>'+
        '</div>'+
        '<div class="map-user-btn">'+
        '<div class="map-user-btn-right">'+
        '<a href="javascript:getLocation()"><img src="images/map-user-ico4.png" title="实时定位" width="26" height="26" /></a>'+
        '<a href="javascript:showTongji();"><img src="images/map-user-ico5.png" title="实时监测" width="26" height="26" /></a>' +
        '</div>'+
        '</div>'+
        '</div>';
    $("#ssjc_yundongyuan").empty();
    //计算样式
    var start = (currentPageIndex - 1) * pageSize;
    var end = currentPageIndex * pageSize > totalCount ? totalCount : pageSize * currentPageIndex;
    var top = 170+(end - start) * 38 + 35;//170为固定，38为每条记录的高度，35为底页的高度
    $("#ssjc_yundongyuan").attr("style","display:block;top:"+top+"px;");
    $("#ssjc_yundongyuan").append(itemStr);
    lastUserCode=userList[index].Code;
    socket.send("$00004" + userList[index].Code);
}
//加载运动回放的用户卡片
function loadYDHFUser(index){
    var sex=userList[index].Sex == 1 ? "男" : "女";
    var itemStr = '<div class="map-user-box" style="height:160px;">'+
        '<div class="map-user-close"><a href="javascript:setAttr(\'.ydhf\',\'style\',\'top: 100px;height:auto;width:auto; display:none;\')">'+
        '<img src="images/map-user-close.png" width="20" height="20" /></a></div>'+
        '<div class="map-user-head">'+
        '<div class="map-user-img"><img src="images/photos/' + userList[index].Photo + '" width="66" height="66" style="box-shadow: 1px 1px 13px #8A8888;" /></div>'+
        '<div class="map-user-id"><a href="#"></a>'+userList[index].Code+'</div>'+
        '</div>'+
        '<div class="map-user-txt">'+
        '<table width="100%" border="0" cellspacing="0" cellpadding="0">'+
        '<tbody>'+
        '<tr>'+
        '<td width="50%" height="29">姓名：'+userList[index].Name+'</td>'+
        '<td height="29">性别：'+sex+'</td>'+
        '</tr>'+
        '<tr>'+
        '<td width="50%" height="29">行程：'+userList[index].Score+' km</td>'+
        '<td height="29">&nbsp;</td>'+
        '</tr>'+
        '<tr>'+
        '<td width="80%" colspan="2" height="29">'+
        '时间：<input type="text" value="9：00--13：30" style="background: #fff; border: 1px solid #ccc;width:150px;" />'+
        '<a href="javascript:showHistory();" style="float: right;"><img src="images/map-user-ico3.png" title="历史数据" width="26" height="26" /></a>'+
        '</td>'+
        '</tr>'+
        '</tbody>'+
        '</table>'+
        '</div>'+
        '</div>';
    $(".ydhf").empty();
    //计算样式
    var start = (currentPageIndex - 1) * pageSize;
    var end = currentPageIndex * pageSize > totalCount ? totalCount : pageSize * currentPageIndex;
    var top = 170+(end - start) * 38 + 35;//170为固定，38为每条记录的高度，35为底页的高度
    $(".ydhf").attr("style","display:block;top:"+top+"px;");
    $(".ydhf").append(itemStr);
}
//记载异常监测的用户卡片
function loadYCJCUser(index){
    var sex = userList[index].Sex == 1 ? "男" : "女";
    var distance =lastMlsData==null?0+' m':lastMlsData.Distance >= 1000 ? lastMlsData.Distance / 1000 + ' km' : lastMlsData.Distance + ' m';
    var itemStr = '<div class="map-user-box">' +
        '<div class="map-user-close"><a href="javascript:setAttr(\'.map-user.ycjcCard\',\'style\',\'left:400px; top:100px;display:none;\');' +
        'javascript:setAttr(\'#ssjc_tongji\',\'style\',\'display:none;\');javascript:clearMonitor();">' +
        '<img src="images/map-user-close.png" width="20" height="20" /></a></div>' +
        '<div class="map-user-head">'+
        '<div class="map-user-img"><img src="images/photos/' + userList[index].Photo + '" width="66" height="66" style="box-shadow: 1px 1px 13px #8A8888;" /></div>' +
        '<div class="map-user-id"><a href="#"></a>ID：' + userList[index].Code + '</div>' +
        '</div>'+

        '<div class="map-user-txt">'+
        '<table width="100%" border="0" cellspacing="0" cellpadding="0">'+
        '<tbody>'+
        '<tr>'+
        '<td width="50%" height="29">姓名：' + userList[index].Name + '</td>' +
        '<td height="29">性别：' + sex + '</td>' +
        '</tr>'+
        '<tr>'+
        '<td width="50%" height="29" id="mlsDistance">行程：' + distance + '</td>' +
        '<td height="29">&nbsp;</td>'+
        '</tr>'+
        '</tbody>'+
        '</table>'+
        '</div>'+
        '<div class="map-user-btn">'+
        '<div class="map-user-btn-right">'+
        '<a href="javascript:getLocation()"><img src="images/map-user-ico4.png" title="实时定位" width="26" height="26" /></a>'+
        '<a href="javascript:showTongji();"><img src="images/map-user-ico5.png" title="实时监测" width="26" height="26" /></a>' +
        '</div>'+
        '</div>'+
        '</div>';
    $("#abnormalUserCard").empty();
    $("#abnormalUserCard").attr("style","left:400px; top:100px;");
    $("#abnormalUserCard").append(itemStr);
    lastUserCode=userList[index].Code;
    socket.send("$00004" + userList[index].Code);
}
/**
  * 获取用户的实时定位
  */
function getLocation() {
    if (pl==null||pl.paths.length == 0||pl.paths[0].length == 0) {//pl为init.js内websocket数据
        alert("未能接收到该用户数据！");
        return;
    }
    lng = pl.paths[0][pl.paths[0].length - 1][0];//最后一个pl数据
    lat = pl.paths[0][pl.paths[0].length - 1][1];
    /*
     *  var inaccuratePoint ={"lat":lat,"lng":lng};
     BMap.Convertor.translate(inaccuratePoint, 0, function (point) {
     var pointCz = { lng: point.lng - inaccuratePoint.lng, lat: point.lat - inaccuratePoint.lat };
     var x = inaccuratePoint.lng - myAction.oPointOffset.lng - pointCz.lng,
     y = inaccuratePoint.lat - myAction.oPointOffset.lat - pointCz.lat;
     myPositionPoint = new esri.geometry.Point(x, y, new esri.SpatialReference({ wkid: 4490 }));
     });
     */
    myPositionPoint = new esri.geometry.Point(parseFloat(lng), parseFloat(lat), new esri.SpatialReference({ wkid: 4490 }));

    mypositionAGraphic = new esri.Graphic(myPositionPoint, new esri.symbol.PictureMarkerSymbol('images/myPosition.png', 16, 16));//面，以点汇面
    if (myPositionLayer == undefined ||myPositionLayer == null) {
        myPositionLayer = new esri.layers.GraphicsLayer({ id: "myPositionMap" });//layer，在图层中添加面
    }
    myPositionLayer.add(mypositionAGraphic);
    map.addLayer(myPositionLayer);
    //图层显示级别 
    myPositionLayer.show();
    map.centerAndZoom(myPositionPoint, 15);
}
//外部调用统计的显隐
function hideTongji() {
    $("#ssjc_tongji div").attr("style", "display:none");
    $(".divOpenSSJC_DATA").attr("style", "position: fixed;bottom: 0px;");
    $("#ssjc_tongji").attr("style", "width:0;height:20;left:49%");
}
function showTongji() {
    $("#ssjc_tongji div").attr("style", "display:inline");
    $(".divCloseSSJC_DATA").attr("style", "");
    $(".divOpenSSJC_DATA").attr("style", "display:none");
    $("#ssjc_tongji").attr("style", "width:100%;height:238px;left:0");
}

//根据用户卡片
function showHistory(){
    //服务器查询

    //是否要用户端更新

    //socket.send("$00004" + userList[index].Code);
}
/**
 *清空实时监测对地图的操作
 */
function clearMonitor() {
    if (myPositionLayer != undefined || myPositionLayer != null) {
        myPositionLayer.hide();
    }
    //hideTongji();
    pl=new esri.geometry.Polyline(new esri.SpatialReference({ wkid: 4326 }));//清空数据
    pl.addPath(xys);
    dataIndex=0;
    if(lastUserCode!=null) {
        socket.send("$00005" + lastUserCode);//停止发送运动员的实时数据
    }
}

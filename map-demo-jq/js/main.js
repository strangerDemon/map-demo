
/*入口脚本*/
requirejs.config({
    map: {
        '*': {
            //'css': '../lib/css',
        }
    },
    paths: {
        //   jquery: '../lib/js/jquery.min',
        //qrcode: '../lib/js/jquery.qrcode.min',
        //baiduApi: "http://api.map.baidu.com/api?v=2.0&ak=mp7UQ7pMBx9SciF4Di0kFfnE",
        //baiduConvertor: "http://developer.baidu.com/map/jsdemo/demo/convertor",
        //ssmyPosition: "ssmyPosition",
        //jqprint: '../lib/js/jquery.jqprint-0.3',
        //autocomplete: '../lib/autocomplete/jquery.autocomplete',
        jpicker: 'jpicker/jpicker-1.1.6',
        //ztree: '../lib/zTree/js/jquery.ztree.all-3.5.min',
        //picViewer: '../lib/picViewer/dist/viewer',
        //fullscreen: '../lib/fullscreen',

        //lightbox: '../lib/lightbox2/2.8.1/js/lightbox',
        //ts_divscroller: 'ts_divscroller',
        //ssthematicmap: 'js/ssthematicmap.js'
    },
    shim: {

    }
});


////专题图
//requirejs(['ztree', 'css!../lib/zTree/css/zTreeStyle/metro'], function () {

//})

//requirejs(['ts_divscroller'], function () {
//    $('.route_Plan').perfectScrollbar();
//    $('#route_bus_container').perfectScrollbar();
//    $('.searchResultItems').perfectScrollbar();
//    $('.divDistrictList').perfectScrollbar();
//    $('.divCatagoryList').perfectScrollbar();
//    $('.contentPane').perfectScrollbar();
//    $('#divZhuanTiListTree').perfectScrollbar();
//});


//requirejs(['baiduApi', 'baiduConvertor', 'ssmyPosition'], function () {
//    //百度地图无法使用
//})


requirejs(['jpicker', 'css!jpicker/css/jPicker-1.1.6'], function () {
    $('.jPicker').jPicker({
        window: {
            position: {
                x: 'screenCenter',
                y: 'bottom'
            }, expandable: true
        }, color: {
            alphaSupport: true,
            active: new $.jPicker.Color({ hex: '1e7efc' })
        }, images: {
            clientPath: 'jpicker/images/'
        }, localization: {
            text: {
                title: '拖动鼠标选中一个颜色',
                newColor: '选中颜色',
                currentColor: '当前颜色',
                ok: '确定',
                cancel: '取消'
            }, tooltips: {
                colors: {
                    newColor: '点击确定提交新选颜色',
                    currentColor: '点击这里还原当前颜色'
                }, buttons: {
                    ok: '提交选中的颜色',
                    cancel: '取消并恢复当前颜色'
                }
            }
        }
    });
    //线型
    $('.styleLine_select_box .son_ul').hide(); //初始ul隐藏
    $('.styleLine_select_box span').hover(function () { //鼠标移动函数
        $(this).parent().find('ul.son_ul').slideDown();  //找到ul.son_ul显示
        $(this).parent().find('li').hover(function () { $(this).addClass('hover') }, function () { $(this).removeClass('hover') }); //li的hover效果
        $(this).parent().hover(function () { },
            function () {
                $(this).parent().find(".styleLine_select_box ul.son_ul").slideUp();
            });
    }, function () { });
    $('.styleLine_select_box ul.son_ul li').click(function () {
        $(".styleLine_select_box span").html($(this).html());
        //   $(this).parents('li').find('ul').slideUp();
        $('.styleLine_select_box .son_ul').hide();

    });
})

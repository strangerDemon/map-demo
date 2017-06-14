/**
 * 实时统计 demo learn
 * Created by Administrator on 2017/5/12.
 */
//请求数据
//实时监测的数据
$(function () {
        Vue.component('v-staticstic', {
                props: ['detail'],
                template: '<tr><td width="50%" height="29">{{detail.Distance}}</td><td height="29">人数：{{detail.Total}}人</td></tr>',
                data: function () {
                    return {}
                }

            },
        );

        window.vm = new Vue({
            // el: "#map-menu-statistics-table",
            data: {
                isShow: true,
                statisticsList: [],
            },
            computed: {},
            watch: {
                statisticsList(){
                    //console.log(this.statisticsList);
                }
            },
            methods: {
                ajax(value){
                    return $.ajax({
                        type: "GET", //访问WebService使用Post方式请求
                        url: "http://www.ztgis.com:8883/xmtdt.asmx/getStatistics?para={'Token':'" + token + "','group':'" + value + "'}", //调用WebService
                        dataType: 'json'
                    });
                },
                getValue(value){
                    var vm = this;
                    this.ajax(value).then(function (resp) {//then 等待前面数据后在执行内部
                        vm.statisticsList = resp.Results;
                        var list=[];
                        for(let i=0;i<vm.statisticsList.length;i++){
                            list.push([vm.statisticsList[i].Distance,vm.statisticsList[i].Total]);
                        }
                        $('#divtjfx').highcharts(getTJChartConfig('马拉松运动员行程统计','行程',list));
                    });
                }
            },
            mounted: function () {
                this.getValue(1);
            }
        });
    }
)

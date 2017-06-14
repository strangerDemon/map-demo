/**
 * 异常用户员
 * 通过tcp端获取，不是走api接口
 * Created by Administrator on 2017/5/12.
 */
window.abnormalList = [];

function setAbNormalList(abnormal) {//userCode|118.115037,24.490596|61|0.0|0|0|37.0|52|68
    var info = abnormal.split("|");//单个的数据
    for (var i = 0; i < abnormalList.length; i++) {
        if (abnormalList[i].name == info[0]) {//以前就存在
            abnormalList.splice(i, i + 1);
        }
    }
    var d = {"name": info[0], "time": new Date().toLocaleTimeString(), "heartRate": info[2]};
    abnormalList.push(d);
}

//需要最后加载
$(function () {
    //组件的名字不能有大写字母,组件的名字都统一使用小写
    Vue.component('v-abnormal', {
        // 设置组件的属性,属性名都得是小写
        props: ['detail'],

        template: '<div class="yc_ry_item" style=" "> \
                        <span  @click="showUserClick(detail)">\
                        {{detail.time}}: &nbsp;&nbsp;  {{detail.name}} \
                            <span style="color:red;"> \
                            ---心率过高--{{detail.heartRate}}\
                            </span>\
                        </span>\
                        <img src="images/map-user-close.png" @click="deleteUser(detail)" \
                            style="float: right;padding:3px;padding-left: 10px;" width="15px" height="15px"/>\
                     </div>',
        // 在组件的定义中data必须是函数，而且必须有返回值。
        data: function () {
            return {}
        },
        methods: {
            //vue 写法
            showUserClick(detail){
                ApiRequest(detail.name);
                window.userList=window.result.Results;
                loadYCJCUser(0);//加载基本信息
                getUserLastMlsData(detail.name,0);//加载行程
            },
            deleteUser(detail){
                for (var i = 0; i < abnormalList.length; i++) {
                    if (abnormalList[i].name == detail.name) {//以前就存在
                        abnormalList.splice(i, i + 1);
                    }
                }
            }
        },
    });

    new Vue({
        el: "#abnormalList",
        data: {
            isShow: true,
            abnormalList: [],
        },

        mounted: function () {
            this.abnormalList = window.abnormalList
            console.log(this.$el)
        }
    });

})
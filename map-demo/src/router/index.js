import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import Map from '@/components/Map'
/* Vue.use 使用的根路径 */
Vue.use(Router)

export default new Router({
  /* 路由路径，配置显示的页面 */
  routes: [
    {
      path:'/',
      redirect:'/pages/'
    },
    {
      path:'/pages',
      children:[
        {
          path: '',
          redirect: '/pages/Main' /* 一定要在 /pages/** */
        },
        {
          path:'Hello',
          name:'Hello',
          component:Hello
        },
        {
          path:'Map',
          name:'Map',
          component:Map
        }
      ]
    },
  ]
})

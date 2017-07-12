/**
 * Created by Administrator on 2017/7/12.
 */
import {
  asmx
} from '@/utils'
/**
 * Initial state
 * @type {Object}
 */
const state = {
  mapcenter: "118.133988, 24.5698",
  maplevel: "10",
  systitle: "天地图·厦门",
  mapfullextent: "117.882220756,24.422481324,118.454166203,24.907266363",
  xm_dataprovider: "提供单位：厦门市国土资源与房产管理局",
  xm_datasourse: "数据来源：天地图·厦门",
  xm_regmapcode: "闽S[2016]33号 ",
  gj_dataprovider: "提供单位：国家测绘地理信息局",
  gj_datasourse: "数据来源：天地图"
}

/**
 * Getters
 * @type {Object}
 */
const getters = {

}

/**
 * Mutations
 * @type {Object}
 */
const mutations = {
  //标绘
  getInitSysConfig(state,info) {
    asmx.post('getSysConfigPara').then(function (resp) {
      state = resp;
      console.log('state',state);
    })
  },
}

/**
 * Actions
 * @type {Object}
 */
const actions = {

}

// Export module
export default { state, getters, mutations, actions }


/**
 * 澪 Mio WeChat App
 * 小程序入口文件
 */

const auth = require('./utils/auth')

App({
  
  onLaunch() {
    // 检查登录状态
    if (!auth.isLoggedIn()) {
      wx.reLaunch({
        url: '/pages/login/login'
      })
    }
  },

  globalData: {
    // 全局数据
  }
})

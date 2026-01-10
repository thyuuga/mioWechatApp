/**
 * 登录页面
 */

const request = require('../../utils/request')
const auth = require('../../utils/auth')

Page({
  data: {
    username: '',
    password: '',
    loading: false
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value })
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value })
  },

  async onLogin() {
    const { username, password } = this.data

    if (!username || !password) {
      wx.showToast({
        title: '请输入用户名和密码',
        icon: 'none'
      })
      return
    }

    this.setData({ loading: true })

    try {
      const res = await request.post('/auth/login', { username, password }, true)

      // 适配不同的返回字段：access_token 或 token
      const token = res.access_token || res.token

      if (!token) {
        throw new Error('登录返回数据异常')
      }

      // 保存 token
      auth.setToken(token)

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })

      // 跳转到会话列表
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/sessions/sessions'
        })
      }, 500)
    } catch (err) {
      console.error('Login failed:', err)
      wx.showToast({
        title: err.message || '登录失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  }
})

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
      console.log('Login response:', res)

      // 适配不同的返回格式
      if (res.ok && res.token) {
        console.log('Saving token:', res.token)
        auth.setToken(res.token)
      } else if (res.access_token) {
        auth.setToken(res.access_token)
      } else {
        throw new Error('登录返回数据异常')
      }

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })

      // 跳转到聊天页面
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/chat/chat'
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

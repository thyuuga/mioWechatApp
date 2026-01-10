/**
 * 会话列表页面
 */

const request = require('../../utils/request')
const auth = require('../../utils/auth')

Page({
  data: {
    sessions: [],
    loading: false
  },

  onShow() {
    // 检查登录状态
    if (!auth.isLoggedIn()) {
      wx.reLaunch({
        url: '/pages/login/login'
      })
      return
    }
    this.loadSessions()
  },

  async loadSessions() {
    this.setData({ loading: true })

    try {
      const res = await request.get('/sessions')

      // 适配不同返回格式：{ sessions: [...] } 或直接数组
      let sessions = Array.isArray(res) ? res : (res.sessions || [])

      // 格式化时间
      sessions = sessions.map(item => ({
        ...item,
        updatedAtFormatted: this.formatTime(item.updated_at)
      }))

      this.setData({ sessions })
    } catch (err) {
      console.error('Load sessions failed:', err)
      wx.showToast({
        title: err.message || '加载失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  formatTime(timeStr) {
    if (!timeStr) return ''

    const date = new Date(timeStr)
    const now = new Date()

    // 同一天显示时间
    if (date.toDateString() === now.toDateString()) {
      return `${this.pad(date.getHours())}:${this.pad(date.getMinutes())}`
    }

    // 同一年显示月日
    if (date.getFullYear() === now.getFullYear()) {
      return `${date.getMonth() + 1}/${date.getDate()}`
    }

    // 其他显示完整日期
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
  },

  pad(num) {
    return num < 10 ? '0' + num : '' + num
  },

  onSessionTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/chat/chat?session_id=${id}`
    })
  },

  onNewChat() {
    wx.navigateTo({
      url: '/pages/chat/chat'
    })
  },

  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          auth.clearToken()
          wx.reLaunch({
            url: '/pages/login/login'
          })
        }
      }
    })
  }
})

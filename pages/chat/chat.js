/**
 * 聊天页面
 */

const request = require('../../utils/request')

Page({
  data: {
    sessionId: null,
    messages: [],
    inputValue: '',
    sending: false,
    scrollToView: '',
    loading: false
  },

  async onLoad(options) {
    if (options.session_id) {
      // 如果有指定 session_id，直接加载
      const sid = options.session_id
      this.setData({ sessionId: sid })
      this.loadHistory(sid)
    } else {
      // 否则自动获取最近的 session
      await this.loadLatestSession()
    }
  },

  async loadLatestSession() {
    this.setData({ loading: true })
    try {
      const res = await request.get('/sessions')
      const sessions = Array.isArray(res) ? res : (res.sessions || [])

      if (sessions.length > 0) {
        // 取最近的 session（假设列表按时间排序）
        const latestSession = sessions[0]
        this.setData({ sessionId: latestSession.id })
        await this.loadHistory(latestSession.id)
      }
    } catch (err) {
      console.error('Load latest session failed:', err)
    } finally {
      this.setData({ loading: false })
    }
  },

  async loadHistory(sessionId) {
    this.setData({ loading: true })
    try {
      const res = await request.get(`/sessions/${sessionId}`)
      const messages = res.messages || []
      this.setData({
        messages,
        scrollToView: messages.length ? `msg-${messages.length - 1}` : ''
      })
    } catch (err) {
      console.error('Load history failed:', err)
      wx.showToast({
        title: '加载历史记录失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },


  onInputChange(e) {
    this.setData({ inputValue: e.detail.value })
  },

  async onSend() {
    const { inputValue, sessionId, messages, sending } = this.data
    if (!inputValue.trim() || sending) return

    const userMessage = inputValue.trim()

    // 先把用户消息显示出来
    const newMessages = [...messages, { role: 'user', content: userMessage }]
    this.setData({
      inputValue: '',
      messages: newMessages,
      sending: true,
      scrollToView: `msg-${newMessages.length - 1}`
    })

    try {
      // 如果还没有 sessionId，先创建一个
      let sid = sessionId
      if (!sid) {
        const created = await request.post('/sessions', {})
        sid = created.id
        this.setData({ sessionId: sid })
      }

      // 发送聊天
      const res = await request.post('/chat', {
        message: userMessage,
        sessionId: sid
      })

      const updatedMessages = [
        ...newMessages,
        { role: 'assistant', content: res.reply }
      ]

      this.setData({
        messages: updatedMessages,
        sending: false,
        scrollToView: `msg-${updatedMessages.length - 1}`
      })

    } catch (err) {
      console.error('Send message failed:', err)
      wx.showToast({
        title: err.message || '发送失败',
        icon: 'none'
      })
      this.setData({ sending: false })
    }
  }
})

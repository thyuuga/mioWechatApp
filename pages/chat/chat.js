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
    usage: null
  },

  onLoad(options) {
    if (options.session_id) {
      const sid = options.session_id
      const history = wx.getStorageSync(`messages_${sid}`) || []

      this.setData({
        sessionId: sid,
        messages: history,
        scrollToView: history.length
          ? `msg-${history.length - 1}`
          : ''
      })
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

    // ✅ 先暂存（如果还没有 sessionId，就存 temp）
    wx.setStorageSync(`messages_${sessionId || 'temp'}`, newMessages)

    try {
      // 如果还没有 sessionId，先创建一个
      let sid = sessionId
      if (!sid) {
        const created = await request.post('/sessions', {})
        sid = created.id
        this.setData({ sessionId: sid })

        // ✅ 把 temp 消息迁移到真正的 sessionId
        const tempMessages = wx.getStorageSync('messages_temp') || []
        if (tempMessages.length) {
          wx.setStorageSync(`messages_${sid}`, tempMessages)
          wx.removeStorageSync('messages_temp')
        }
      }

      // 真正发送聊天
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

      // ✅ 存最终版本（包含 assistant 回复）
      wx.setStorageSync(`messages_${sid}`, updatedMessages)

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

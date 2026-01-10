/**
 * Token 管理工具
 */

const TOKEN_KEY = 'mio_access_token'

/**
 * 获取存储的 token
 * @returns {string|null}
 */
function getToken() {
  try {
    return wx.getStorageSync(TOKEN_KEY) || null
  } catch (e) {
    console.error('getToken error:', e)
    return null
  }
}

/**
 * 保存 token
 * @param {string} token
 */
function setToken(token) {
  try {
    wx.setStorageSync(TOKEN_KEY, token)
  } catch (e) {
    console.error('setToken error:', e)
  }
}

/**
 * 清除 token
 */
function clearToken() {
  try {
    wx.removeStorageSync(TOKEN_KEY)
  } catch (e) {
    console.error('clearToken error:', e)
  }
}

/**
 * 检查是否已登录
 * @returns {boolean}
 */
function isLoggedIn() {
  return !!getToken()
}

module.exports = {
  getToken,
  setToken,
  clearToken,
  isLoggedIn
}

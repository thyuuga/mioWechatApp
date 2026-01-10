/**
 * 网络请求封装
 * - 自动添加 Authorization header
 * - 统一处理 401 未授权
 */

const config = require('./config')
const auth = require('./auth')

/**
 * 发起请求
 * @param {Object} options
 * @param {string} options.url - API 路径（不含 base）
 * @param {string} options.method - 请求方法，默认 GET
 * @param {Object} options.data - 请求数据
 * @param {boolean} options.noToken - 是否不带 token（如登录接口）
 * @returns {Promise}
 */
function request(options) {
  return new Promise((resolve, reject) => {
    const { url, method = 'GET', data = {}, noToken = false } = options

    // 构建完整 URL
    const fullUrl = `${config.API_BASE}${config.API_PREFIX}${url}`

    // 构建 header
    const header = {
      'Content-Type': 'application/json'
    }

    // 添加 token
    if (!noToken) {
      const token = auth.getToken()
      if (token) {
        header['Authorization'] = `Bearer ${token}`
      }
    }

    wx.request({
      url: fullUrl,
      method,
      data,
      header,
      success(res) {
        // 处理 401 未授权
        if (res.statusCode === 401) {
          auth.clearToken()
          wx.reLaunch({
            url: '/pages/login/login'
          })
          reject(new Error('未授权，请重新登录'))
          return
        }

        // 处理其他错误状态码
        if (res.statusCode >= 400) {
          const errMsg = res.data?.message || res.data?.error || '请求失败'
          reject(new Error(errMsg))
          return
        }

        resolve(res.data)
      },
      fail(err) {
        console.error('Request failed:', err)
        reject(new Error(err.errMsg || '网络请求失败'))
      }
    })
  })
}

/**
 * GET 请求
 */
function get(url, data = {}) {
  return request({ url, method: 'GET', data })
}

/**
 * POST 请求
 */
function post(url, data = {}, noToken = false) {
  return request({ url, method: 'POST', data, noToken })
}

module.exports = {
  request,
  get,
  post
}

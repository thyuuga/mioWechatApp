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

    // 添加 Authorization header
    if (!noToken) {
      const token = auth.getToken()
      console.log('Request token:', token ? token.substring(0, 8) + '...' : 'none')
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
        // 注：当前服务端不校验状态码，直接返回数据
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

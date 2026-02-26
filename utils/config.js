/**
 * API 配置文件
 *
 * 注意：微信小程序开发时不能使用 localhost
 * 本地开发请使用局域网 IP（如 192.168.x.x）
 * 并在微信开发者工具中勾选「不校验合法域名」
 *
 * 生产环境需在小程序后台配置 request 合法域名
 */

const config = {
  // API 基础地址，请替换为实际域名或局域网 IP
  API_BASE: 'https://mio.thyuuga.com',
  // API_BASE: 'https://your-domain.com',

  // API 前缀
  API_PREFIX: '/mio'
}

module.exports = config

const axios = require('axios')
exports.logError = async (e, req, ...args) => {
  try {
    console.error(...args, e.message,
      e.response && e.response.data, (e.config && e.config.url) || e,
      (await this.getCity(req.headers['x-forwarded-for'].split(',')[0])).region)
  } catch (e) {
    console.error(e)
  }
}

exports.getCity = (ip) => {
  return axios.get(`https://ipinfo.io/${ip}?token=${process.env.IPINFO_TOKEN}`).then(d => d.data)
}

const axios = require('axios')
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')
const client = new SecretsManagerClient({ region: 'us-east-1' })
const mysql = require('./mysql')
let traccarAdmin
const traccar = axios.create({ withCredentials: true, baseURL: 'https://api.pinme.io/api' })
const { wrapper } = require('axios-cookiejar-support')
const { CookieJar } = require('tough-cookie')

exports.devices = async (cookie) => {
  return traccar.get('devices', { headers: { cookie } }).then(d => d.data)
}

exports.positions = async (cookie) => {
  return traccar.get('positions', { headers: { cookie } }).then(d => d.data)
}

exports.admin = {
  async getDevicesById (deviceIds) {
    const traccar = await getTraccar()
    const url = '/devices?' + deviceIds.map(d => 'id=' + d).join('&')
    return traccar.get(url).then(d => d.data)
  },
  async getPosition (positionId, deviceId) {
    const traccar = await getTraccar()
    return traccar.get(`/positions?id=${positionId}&deviceId=${deviceId}`).then(d => d.data)
  }
}

const users = {
  async get (id) {
    const traccar = await getTraccar()
    return traccar.get('/users/' + id).then(d => d.data)
  },
  async put (user) {
    const traccar = await getTraccar()
    return traccar.put('/users/' + user.id, user).then(d => d.data)
  }
}

const session = {
  async post (user) {
    const jar = new CookieJar()
    const client = wrapper(axios.create({ jar }))
    const body = 'email=' + encodeURIComponent(user.email) + '&password=' + encodeURIComponent(user.password)
    return client.post('https://api.pinme.io/api/session', body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
  }
}

function getTraccar () {
  if (!traccarAdmin) {
    traccarAdmin = client.send(new GetSecretValueCommand({ SecretId: process.env.TRACCAR_SECRET_NAME }))
      .then(s => JSON.parse(s.SecretString)).then(auth => axios.create({ auth, baseURL: auth.baseUrl }))
  }
  return traccarAdmin
}

const getUserCookie = async (userId) => {
  const dummyPassword = 'dummyPassword'
  const dbUser = await getUser(userId)
  const oldHash = dbUser.hashedpassword
  const oldSalt = dbUser.salt
  const traccarUser = await users.get(userId)
  traccarUser.password = dummyPassword
  await users.put(traccarUser)
  const [cookie] = await session.post(traccarUser).then(r => r.headers['set-cookie'])
  console.log(cookie)
  await resetHash(userId, oldHash, oldSalt)
  return cookie
}
exports.getUserCookie = getUserCookie

async function getUser (userId) {
  const [user] = await mysql.getRows(`select email, hashedpassword, salt from tc_users where id=${userId}`)
  return user
}

async function resetHash (userId, oldHash, oldSalt) {
  await mysql.getRows(`update tc_users set hashedpassword='${oldHash}', salt='${oldSalt}' where id=${userId}`)
}

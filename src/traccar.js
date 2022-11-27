const axios = require('axios')
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')
const client = new SecretsManagerClient({ region: 'us-east-1' })
let traccar

exports.devices = async (userId) => {
  const traccar = await getTraccar()
  return traccar.get(`/devices?userId=${userId}`).then(d => d.data)
}

exports.positions = async (positionIds) => {
  const traccar = await getTraccar()
  return traccar.get('/positions?' + positionIds.map(p => `id=${p}`).join('&')).then(d => d.data)
}

function getTraccar () {
  if (!traccar) {
    traccar = client.send(new GetSecretValueCommand({ SecretId: process.env.TRACCAR_SECRET_NAME }))
      .then(s => JSON.parse(s.SecretString)).then(auth => axios.create({ auth, baseURL: auth.baseUrl }))
  }
  return traccar
}

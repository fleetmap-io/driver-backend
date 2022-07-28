const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')
const client = new SecretsManagerClient({ region: 'us-east-1' })
const _secret = client.send(new GetSecretValueCommand({ SecretId: process.env.TRACCAR_SECRET_NAME })).then(s => JSON.parse(s.SecretString))
const { DynamoDBClient, ScanCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb')
const dynamo = new DynamoDBClient({ region: 'us-east-1' })
const { unmarshall, marshall } = require('@aws-sdk/util-dynamodb')
const axios = require('axios')

exports.get = async (token, user, deviceId) => {
  console.log('get', token, user)
  if (token) {
    const dDevice = await dynamo.send(new ScanCommand({
      TableName: process.env.DEVICES_TABLE,
      FilterExpression: '#token = :token',
      ExpressionAttributeValues: marshall({ ':token': token }, { removeUndefinedValues: true }),
      ExpressionAttributeNames: { '#token': 'token' }
    }))
    console.log(dDevice)
    const d = unmarshall(dDevice.Items[0])
    console.log('device', d)
    deviceId = d.deviceId
  }
  if (token || deviceId) {
    const auth = await _secret
    const axios = require('axios').create({ auth, baseURL: auth.baseUrl })
    const [device] = await axios.get(`devices?id=${deviceId}`).then(d => d.data)
    device.attributes.driverUniqueId = user.username
    await axios.put(`devices/${device.id}`, device)
    const computed = await axios.get('attributes/computed?deviceId=' + device.id).then(d => d.data)
    if (!computed.find(a => a.id === 37)) {
      await axios.post('permissions', { deviceId: device.id, attributeId: 37 })
    }
    return device
  } else {
    console.log('getting', user.username)
    const _user = await dynamo.send(new GetItemCommand({
      TableName: process.env.DRIVER_USER_TABLE,
      Key: marshall({ id: user.username })
    }))
    user = unmarshall(_user.Item)
    const secret = await _secret
    return axios.get(`${secret.basePath}/devices?userId=${user.parentUserId}`, { auth: secret }).then(d => d.data.sort((a, b) => {
      if (a.name > b.name) {
        return 1
      }
      if (a.name < b.name) {
        return -1
      }
      return 0
    }))
  }
}

exports.immobilize = async (device) => {
  const auth = await _secret
  const axios = require('axios').create({ auth, baseURL: auth.baseUrl })
  console.log(await axios.post('commands/send', { deviceId: device.id, type: 'custom', attributes: { data: 'setdigout 1' }, description: 'driver backend' }))
}

exports.mobilize = async (device) => {
  const auth = await _secret
  const axios = require('axios').create({ auth, baseURL: auth.baseUrl })
  await axios.post('commands/send', { deviceId: device.id, type: 'custom', attributes: { data: 'setdigout 0' }, description: 'driver backend' })
}

exports.startTrip = async (device) => {
  const auth = await _secret
  const axios = require('axios').create({ auth, baseURL: auth.baseUrl })
  await axios.post('commands/send', { deviceId: device.id, type: 'custom', attributes: { data: 'setparam 11700:0' }, description: 'driver backend' })
}

exports.endTrip = async (item) => {
  const auth = await _secret
  const axios = require('axios').create({ auth, baseURL: auth.baseUrl })
  const [device] = await axios.get('devices/' + item.id).then(d => d.data)
  if (device.attributes.driverUniqueId) {
    console.log('Logout driver', device.id, device.attributes.driverUniqueId)
    delete d.attributes.driverUniqueId
    await axios.put('devices/' + device.id, device)
  }
}

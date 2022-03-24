const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')
const client = new SecretsManagerClient({ region: 'us-east-1' })
const _secret = client.send(new GetSecretValueCommand({ SecretId: process.env.TRACCAR_SECRET_NAME })).then(s => JSON.parse(s.SecretString))
const axios = require('axios')
const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb')
const dynamo = new DynamoDBClient({ region: 'us-east-1' })
const { unmarshall, marshall } = require('@aws-sdk/util-dynamodb')

exports.get = async (token, user) => {
  console.log('get', token, user)
  const ddevice = await dynamo.send(new ScanCommand({
    TableName: process.env.DEVICES_TABLE,
    FilterExpression: '#token = :token',
    ExpressionAttributeValues: marshall({ ':token': token }),
    ExpressionAttributeNames: { '#token': 'token' }
  }))
  console.log(ddevice)
  const d = unmarshall(ddevice.Items[0])
  console.log('device', d)
  const auth = await _secret
  const [device] = await axios.get(`${auth.basePath}/devices?id=${d.deviceId}`, { auth }).then(d => d.data)
  console.log(device)
  device.attributes.driverUniqueId = user.username
  await axios.put(`${auth.basePath}/devices/${device.id}`, device, { auth })
  const permission = { deviceId: device.id, attributeId: 37 }
  const computed = await axios.get(`${auth.basePath}/attributes/computed/${device.id}`, { auth }).then(d => d.data)
  if (!computed.find(a => a.id === 37)) {
    await axios.post(`${auth.basePath}/permissions`, permission, { auth }).then(d => d.data)
  }
  return device
}

const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')
const client = new SecretsManagerClient({ region: 'us-east-1' })
const _secret = client.send(new GetSecretValueCommand({ SecretId: process.env.TRACCAR_SECRET_NAME })).then(s => JSON.parse(s.SecretString))
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
  const axios = require('axios').create({ auth, baseURL: auth.basePath })
  const [device] = await axios.get(`devices?id=${d.deviceId}`).then(d => d.data)
  console.log(device)
  device.attributes.driverUniqueId = user.username
  await axios.put(`devices/${device.id}`, device)
  const computed = await axios.get(`attributes/computed/${device.id}`).then(d => d.data)
  if (!computed.find(a => a.id === 37)) {
    await axios.post('permissions', { deviceId: device.id, attributeId: 37 })
  }
  return device
}

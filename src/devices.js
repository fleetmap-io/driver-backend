const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')
const client = new SecretsManagerClient({ region: 'us-east-1' })
const _secret = client.send(new GetSecretValueCommand({ SecretId: process.env.TRACCAR_SECRET_NAME })).then(s => JSON.parse(s.SecretString))
const axios = require('axios')
const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb')
const dynamo = new DynamoDBClient({ region: 'us-east-1' })
const { unmarshall } = require('@aws-sdk/util-dynamodb')

exports.get = async (token) => {
  const device = await dynamo.send(new ScanCommand({
    TableName: process.env.DEVICES_TABLE,
    FilterExpression: 'token = :token',
    ExpressionAttributeValues: { ':token': token },
    Limit: 1
  }))
  const d = unmarshall(device.Item)
  console.log('device', d)
  const secret = await _secret
  return await axios.get(`${secret.basePath}/devices?id=${d.id}`, { auth: secret }).then(d => d.data)
}

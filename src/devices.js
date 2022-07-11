const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')
const client = new SecretsManagerClient({ region: 'us-east-1' })
const _secret = client.send(new GetSecretValueCommand({ SecretId: process.env.TRACCAR_SECRET_NAME })).then(s => JSON.parse(s.SecretString))
const axios = require('axios')
const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb')
const dynamo = new DynamoDBClient({ region: 'us-east-1' })
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb')

exports.get = async ({ username }) => {
  let user = await dynamo.send(new GetItemCommand({
    TableName: process.env.DRIVER_USER_TABLE,
    Key: marshall({ id: username }, { removeUndefinedValues: true })
  }))
  user = unmarshall(user.Item)
  const secret = await _secret
  return await axios.get(`${secret.basePath}/devices?userId=${user.parentUserId}`, { auth: secret }).then(d => d.data)
}

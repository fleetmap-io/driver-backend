const { GetItemCommand, DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const dynamo = new DynamoDBClient({ region: 'us-east-1' })
const { unmarshall, marshall } = require('@aws-sdk/util-dynamodb')

exports.getOdooDB = (user) => {
  console.log('getOdooDb', user)
  // todo: check user database
  return 'db988'
}

exports.getUser = (id) => dynamo.send(new GetItemCommand({
  TableName: process.env.DRIVER_USER_TABLE,
  Key: marshall({ id })
})).then(u => unmarshall(u.Item))

const { ScanCommand, DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb')
const { unmarshall, marshall } = require('@aws-sdk/util-dynamodb')
const { admin } = require('../traccar')
const axios = require('axios')
const { sendSms } = require('../sms')
const dynamo = new DynamoDBClient({ region: 'us-east-1' })
const deviceIds = require('./deviceIds.json')
console.log('using', deviceIds)
const deviceIdsObject = {}
let index = 0
deviceIds.forEach((value) => {
  deviceIdsObject[':deviceidvalue' + ++index] = value
})

exports.ignitionOffTimer = async () => {
  const command = {
    TableName: process.env.DEVICES_TABLE,
    FilterExpression: 'deviceId IN (' + Object.keys(deviceIdsObject).toString() + ')',
    ExpressionAttributeValues: marshall(deviceIdsObject)
  }
  console.log('total devices', deviceIds.length)

  let lastEvaluatedKey = null
  do {
    if (lastEvaluatedKey) {
      command.ExclusiveStartKey = lastEvaluatedKey
    }
    const devices = await dynamo.send(new ScanCommand(command))
    console.log('processing', devices.Items.length)
    for (const item of devices.Items) {
      const dDevice = unmarshall(item)
      const m15 = 15 * 60 * 1000
      if (!dDevice.lastSmsSent ||
            (new Date(dDevice.ignitionOffDate).getTime() < new Date().getTime() - m15 &&
                new Date(dDevice.lastSmsSent).getTime() < new Date().getTime() - m15 &&
                new Date(dDevice.ignitionOffDate).getTime() > new Date(dDevice.lastSmsSent).getTime()
            )
      ) {
        const [device] = await admin.getDevicesById([dDevice.deviceId])
        const [position] = await admin.getPosition(device.positionId, device.id)
        if (!position.attributes.ignition) {
          const sms = await axios.get('https://api.pinme.io/alblambda/smshelper/getenablebuzzersms?deviceid=' +
                device.id).then(d => d.data)
          console.log('sending', sms, 'to', device.id)
          await sendSms(device.phone, sms)
        } else {
          console.log('ignoring late ignition event', device.id, position)
          continue
        }
        dDevice.lastSmsSent = new Date().getTime()
        await dynamo.send(new PutItemCommand({
          TableName: process.env.DEVICES_TABLE,
          Item: marshall(dDevice)
        }))
        console.log('Logout driver', device.name, device.attributes.driverUniqueId)
        if (device.attributes.driverUniqueId) {
          delete device.attributes.driverUniqueId
          await admin.updateDevice(device)
        }
      } else {
        console.log(dDevice.deviceId, 'not enough time since last sms')
      }
    }
    lastEvaluatedKey = devices.LastEvaluatedKey
  } while (lastEvaluatedKey)
}

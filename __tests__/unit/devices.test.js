process.env.TRACCAR_SECRET_NAME = 'arn:aws:secretsmanager:us-east-1:903002861645:secret:traccar-external-7SWVYA'
process.env.DEVICES_TABLE = 'DevicesIgnitionOff'
process.env.DRIVER_USER_TABLE = 'driver-backend-driverUserTable-WO9H2QY2KTV8'

const messages = require('../../src/messages')
const devices = require('../../src/devices')
devices.devicesGet(undefined,
  { locals: { user: { username: 'l.jopia' } }, json: (j) => console.log(j) })

// eslint-disable-next-line no-undef
describe('Test firebase', function () {
  // This test invokes helloFromLambdaHandler() and compare the result
  // eslint-disable-next-line no-undef
  it('gets devices', async () => {
    //    await messages.post({ token: 'cFcFk1cRRMCrdlpSnAW2Gn:APA91bF1Z2TQto8ZM5Z4Ck63q7kdMmxqXuVNHTo-M5tzx_as9MK70WSzqbC2FozKQsQu4w2ivOHwLzdDfsVdlm3g1pQzvbYA4KgrY0SO8j00mBL4XnvbPCpzbPExs66kCMICF0NIIrhW' })
   await testDevices()
  }, 99999)

  // eslint-disable-next-line no-undef
  it('posts messages', async () => {
    //    await messages.post({ token: 'cFcFk1cRRMCrdlpSnAW2Gn:APA91bF1Z2TQto8ZM5Z4Ck63q7kdMmxqXuVNHTo-M5tzx_as9MK70WSzqbC2FozKQsQu4w2ivOHwLzdDfsVdlm3g1pQzvbYA4KgrY0SO8j00mBL4XnvbPCpzbPExs66kCMICF0NIIrhW' })
    await messages.post({ token: 'cu78nOFheUjUo5mbVYsCPV:APA91bFYNfcCD9lUfPeNFXjSlyeK4C0FIrbS7KWoAvqoM78faAs3Lm4RRSzB5xZ-p8o0BsmRL9XdLGu7JP3zNSgicLsmqCwaw2eXxN3b73h1DoJy4Dsl0YbhwnIPE39BUgCmdlgGnIiv' })
  }, 99999)
})
function testDevices() {
  return devices.devicesGet(undefined,
      {locals: {user: {username: 'l.jopia'}}, json: (j) => console.log(j)})
}

testDevices()

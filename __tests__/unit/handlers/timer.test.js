const { ignitionOffTimer } = require('../../../src/handlers/timer')
process.env.DEVICES_TABLE = 'DevicesIgnitionOff'
process.env.TRACCAR_SECRET_NAME = 'arn:aws:secretsmanager:us-east-1:903002861645:secret:traccar-external-7SWVYA'
// This includes all tests for helloFromLambdaHandler()
// eslint-disable-next-line no-undef
describe('Test lambda', async function () {
  // eslint-disable-next-line no-undef
  it('gets ignitionoff', async () => {
    process.env.DEVICES_TABLE = 'DevicesIgnitionOff'
    console.log(await ignitionOffTimer('qgz36fh9veng0b8dsokrgv'))
  }, 9999999)
})

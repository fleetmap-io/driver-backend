// Import all functions from hello-from-lambda.js
const devices = require('../../../src/devices')

// This includes all tests for helloFromLambdaHandler()
// eslint-disable-next-line no-undef
describe('Test lambda', async function () {
  it('test', async () => {
    process.env.DEVICES_TABLE = 'DevicesIgnitionOff'
    console.log(await devices.get('qgz36fh9veng0b8dsokrgv'))
  })
})

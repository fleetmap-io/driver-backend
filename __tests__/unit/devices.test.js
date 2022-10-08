// Import all functions from hello-from-lambda.js
const messages = require('../../src/messages')

// This includes all tests for helloFromLambdaHandler()
describe('Test firebase', function () {
  // This test invokes helloFromLambdaHandler() and compare the result
  it('Verifies successful response', async () => {
    //    await messages.post({ token: 'cFcFk1cRRMCrdlpSnAW2Gn:APA91bF1Z2TQto8ZM5Z4Ck63q7kdMmxqXuVNHTo-M5tzx_as9MK70WSzqbC2FozKQsQu4w2ivOHwLzdDfsVdlm3g1pQzvbYA4KgrY0SO8j00mBL4XnvbPCpzbPExs66kCMICF0NIIrhW' })
    await messages.post({ token: 'cu78nOFheUjUo5mbVYsCPV:APA91bFYNfcCD9lUfPeNFXjSlyeK4C0FIrbS7KWoAvqoM78faAs3Lm4RRSzB5xZ-p8o0BsmRL9XdLGu7JP3zNSgicLsmqCwaw2eXxN3b73h1DoJy4Dsl0YbhwnIPE39BUgCmdlgGnIiv' })
  }, 99999)
})

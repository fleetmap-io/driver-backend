// Import all functions from hello-from-lambda.js
const lambda = require('../../src/devices');

// This includes all tests for helloFromLambdaHandler()
describe('Test devices', function () {
    // This test invokes helloFromLambdaHandler() and compare the result
    it('Verifies successful response', async () => {
        const result = await lambda.get({username:'teste8'});
        expect(result).toHaveLength(15);
    })
})

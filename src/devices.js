const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager")
const client = new SecretsManagerClient({ region: 'us-east-1' });
const _secret = client.send(new GetSecretValueCommand({SecretId: process.env.TRACCAR_SECRET_NAME})).then(s => JSON.parse(s.SecretString))
const axios = require('axios')
const {CognitoIdentityProviderClient, GetUserCommand} = require("@aws-sdk/client-cognito-identity-provider")
const cognito = new CognitoIdentityProviderClient({ region: "us-east-1" })

exports.get = async(AccessToken) => {
    const user = await cognito.send(new GetUserCommand({AccessToken}))
    console.log(user)
    const secret = await _secret
    return await axios.get(`${secret.basePath}/devices?userId=${userId}`, {auth: secret}).then(d => d.data)
}

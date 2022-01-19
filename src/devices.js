const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager")
const client = new SecretsManagerClient({ region: 'us-east-1' });
const _secret = client.send(new GetSecretValueCommand({SecretId: process.env.TRACCAR_SECRET_NAME})).then(s => JSON.parse(s.SecretString))
const axios = require('axios')
exports.get = async(userId) => {
    const secret = await _secret
    return await axios.get(`${secret.basePath}/devices?userId=${userId}`, {auth: secret}).then(d => d.data)
}

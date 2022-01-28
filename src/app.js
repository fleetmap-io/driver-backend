const CognitoExpress = require('cognito-express')
const express = require('express')
const devices = require('./devices')
const bodyParser = require('body-parser')

const cognitoExpress = new CognitoExpress({
  region: 'us-east-1',
  cognitoUserPoolId: process.env.COGNITO_USER_POOOL_ID,
  tokenUse: 'access', // Possible Values: access | id
  tokenExpiration: 3600000 // Up to default expiration of 1 hour (3600000 ms)
})

// eslint-disable-next-line new-cap
const app = new express()
// noinspection JSCheckFunctionSignatures
app.use(require('cors')())
app.use(bodyParser.json())

app.use(async function (req, res, next) {
  const accessTokenFromClient = req.headers.authorization

  if (!accessTokenFromClient) return res.status(401).send('Access Token missing from header')

  await cognitoExpress.validate(accessTokenFromClient.replace('Bearer ', ''), function (err, response) {
    if (err) return res.status(401).send(err)
    res.locals.user = response
    next()
  })
})

app.get('*', async (req, resp) => {
  console.log(resp.locals.user)
  resp.json(await devices.get(resp.locals.user))
})

app.post('*', async (req, res) => {
  console.log(req.path, req.body)
  res.json({ statusCode: 200 })
})

module.exports = app

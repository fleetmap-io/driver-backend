const CognitoExpress = require('cognito-express')
const express = require('express')
const devices = require('./devices')
const bodyParser = require('body-parser')
const orders = require('./orders')
const users = require('./users')
const parser = require('ua-parser-js')
const axios = require('axios')

let cognitoExpress

// eslint-disable-next-line new-cap
const app = new express()
// noinspection JSCheckFunctionSignatures
app.use(require('cors')())
app.use(bodyParser.json())

async function logTokenError (message, req) {
  console.error(message, { ...parser(req.headers['user-agent']), ...(await getCity(req.headers['x-forwarded-for'].split(',')[0])) })
}

async function cogValidateToken (token, callback, retryCounter = 0) {
  if (!cognitoExpress) {
    cognitoExpress = new CognitoExpress({
      region: 'us-east-1',
      cognitoUserPoolId: process.env.COGNITO_USER_POOOL_ID,
      tokenUse: 'access', // Possible Values: access | id
      tokenExpiration: 3600000 // Up to default expiration of 1 hour (3600000 ms)
    })
  }

  try {
    return await cognitoExpress.validate(token, callback)
  } catch (e) {
    if ((retryCounter < 25) && String(e.message).startsWith('Unable to generate certificate due to')) {
      console.error(e)
      cognitoExpress = null
      return cogValidateToken(token, callback, retryCounter + 1)
    }
    throw e
  }
}

function getCity (ip) {
  return axios.get(`https://ipinfo.io/${ip}?token=${process.env.IPINFO_TOKEN}`).then(d => d.data)
}

app.use(async function (req, res, next) {
  console.log(req.method, req.path)
  if (req.path === '/messages') {
    next()
  } else {
    const accessTokenFromClient = req.headers.authorization
    if (!accessTokenFromClient) {
      await logTokenError('Access Token missing from header', req)
      return res.status(401).send('Access Token missing from header')
    }
    await cogValidateToken(accessTokenFromClient.replace('Bearer ', ''), function (err, response) {
      if (err) {
        logTokenError(err.message, req).then(() => res.status(401).send(err))
      } else {
        res.locals.user = response
        next()
      }
    })
  }
})

app.get('/orders/:orderId', async (req, resp) => {
  resp.json(await orders.getOrder(req.params.orderId, users.getOdooDB(resp.locals.user)))
})

app.post('/orders/:orderName', async (req, resp) => {
  resp.json(await orders.updateOrder(req.params.orderName, req.body, users.getOdooDB(resp.locals.user)))
})

app.post('/addPhoto', async (req, res) => {
  res.json(await orders.addPhoto(req.body, users.getOdooDB(res.locals.user)))
})

app.get('/users', async (req, resp) => {
  resp.json(await devices.getUsers(resp.locals.user))
})

app.get('/', async (req, resp) => {
  try {
    resp.json(await devices.get(req.query.token, resp.locals.user, req.query.id))
  } catch (e) {
    console.error(e.message, e.response && e.response.data)
    resp.status(500).send(e.message)
  }
})

app.get('/devices', async (req, resp) => {
  resp.json(await devices.getDevicesAndPositions(resp.locals.user))
})

app.get('/positions', async (req, resp) => {
  resp.json(await devices.positions(req.query.id, resp.locals.user))
})

app.post('/immobilize', async (req, res) => {
  res.json(await devices.immobilize(req.body))
})

app.post('/mobilize', async (req, res) => {
  res.json(await devices.mobilize(req.body))
})

app.post('/startTrip', async (req, res) => {
  res.json(await devices.startTrip(req.body))
})

app.post('/endTrip', async (req, res) => {
  res.json(await devices.endTrip(req.body))
})

app.post('/messages', async (req, res) => {
  await require('./messages').post(req, res)
})

module.exports = app

const secrets = require('./secrets')
const admin = require('firebase-admin')
console.log('init firebase...')
const init = secrets.getSecret('firebaseDriverKey')
  .then(
    key => {
      try {
        admin.initializeApp({ credential: admin.credential.cert(JSON.parse(key)) })
      } catch (e) { console.error(e) }
    }
  ).catch(e => console.error(e))

exports.post = async ({ body }, res) => {
  console.log(body)
  await init
  try {
    res.json(await admin.messaging().send({
      ...body,
      apns: {
        payload: {
          aps: {
            sound: 'default'
          }
        }
      }
    }))
  } catch (e) {
    console.error(e)
    res.status(500).end(e.message)
  }
}

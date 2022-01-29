const Odoo = require('odoo-xmlrpc')
const secrets = require('./secrets')
const configPromise = secrets.getSecret('odoo-13-api-credentials')

const getConfig = async () => { return JSON.parse(await configPromise) }

async function connect (db) {
  const config = await getConfig()
  const odoo = new Odoo({ ...config, db, password: config['master-password'] })
  return new Promise((resolve, reject) => {
    odoo.connect((err) => {
      if (err) {
        console.log('error connection to odoo', err)
        reject(err)
      }
      resolve(odoo)
    })
  })
}

exports.executeKw = async (db, model, method, params, id) => {
  const odoo = await connect(db)
  return new Promise((resolve, reject) => {
    console.log(model, method, params)
    odoo.execute_kw(model, method, id ? [[[id], params]] : [[params]], function (err, value) {
      if (err) { reject(err) }
      resolve(value)
    })
  })
}

exports.create = async (db, model, params) => {
  return this.executeKw(db, model, 'create', params)
}

exports.update = async (db, model, params, id) => {
  return this.executeKw(db, model, 'write', params, id)
}

exports.read = async (db, model, params) => {
  return this.executeKw(db, model, 'read', params)
}

exports.getConfig = getConfig

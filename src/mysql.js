const mysql = require('mysql2/promise')
const host = 'db.pinme.io'
const database = 'traccar'
const secrets = require('./secrets')

let pool

exports.getRows = async (sql) => {
  if (!pool) {
    const secret = await secrets.getSecretObject('rds-mysql-provisioned')
    pool = mysql.createPool({
      host,
      user: secret.username,
      password: secret.password,
      database,
      waitForConnections: true,
      connectionLimit: 40
    })
  }
  return getRowsArray(sql)
}

async function getRows (sql) {
  console.log(sql)
  return pool.query(sql)
}

const getRowsArray = async (sql) => {
  const [result] = await getRows(sql, pool)
  return result
}

const odoo = require('./odoo')
const users = require('./users')

exports.addPhoto = async ({ photoID, photoURL, name }, user) => {
  const database = users.getOdooDB(user)
  const order = await odoo.executeKw(database, 'fsm.order', 'search_read', [['Name', '=', name]])
  console.log(order)
}

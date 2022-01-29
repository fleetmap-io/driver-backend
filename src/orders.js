const odoo = require('./odoo')
exports.addPhoto = async ({ photoID, photoURL, name, database }) => {
  const order = await odoo.executeKw(database || 'db988', 'fsm.order', 'search_read', [['name', '=', name]])
  console.log(order)
}

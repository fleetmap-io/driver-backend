const odoo = require('./odoo')
exports.addPhoto = async ({ photoID, photoURL, name }) => {
  const order = await odoo.executeKw(name, 'fsm.order', 'search_read', [['name', '=', name]])
  console.log(order)
}

const odoo = require('./odoo')
exports.addPhoto = async ({ photoID, photoURL, orderName }) => {
  const order = await odoo.executeKw(orderName, 'fsm.order', 'search_read', [['name', '=', orderName]])
  console.log(order)
}

const odoo = require('./odoo')
const axios = require('axios')

exports.getOrder = async (name, database) => {
  const [order] = await odoo.executeKw(database, 'fsm.order', 'search_read', [['name', '=', name]])
  return order
}

exports.addPhoto = async ({ photoID, photoURL, name }, database) => {
  const order = await this.getOrder(name, database)
  console.log('order', order)
  const image = await axios.get(photoURL, { responseType: 'arraybuffer' })
    .then(r => Buffer.from(r.data, 'binary').toString('base64'))
  await odoo.executeKw(database,
    'ir.attachment',
    'create',
    [{
      res_model: 'fsm.order',
      name: 'image',
      res_id: order.id,
      type: 'binary',
      mimetype: 'image/png',
      store_fname: 'image.png',
      datas: image
    }]
  )
}

exports.updateOrder = async (name, values, database) => {
  const order = await this.getOrder(name, database)
  return await odoo.update(database,
    'fsm.order',
    values,
    order.id
  )
}

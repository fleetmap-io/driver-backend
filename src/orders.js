const odoo = require('./odoo')
const users = require('./users')
const axios = require('axios')

exports.addPhoto = async ({ photoID, photoURL, name }, user) => {
  const database = users.getOdooDB(user)
  const [order] = await odoo.executeKw(database, 'fsm.order', 'search_read', [['name', '=', name]])
  console.log(order)
  const image = await axios.get(photoURL, { responseType: 'arraybuffer' }).then(r => Buffer.from(r.data, 'base64'))
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

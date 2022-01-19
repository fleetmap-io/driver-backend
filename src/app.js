const express = require('express')
const app = new express()
app.use(require('cors')())

app.get('*', (req, resp) => {
    console.log(req)
    resp.json({statusCode: 200})
})

module.exports = app

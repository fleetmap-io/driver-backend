process.env.TRACCAR_SECRET_NAME = 'arn:aws:secretsmanager:us-east-1:903002861645:secret:traccar-external-7SWVYA'
process.env.DEVICES_TABLE = 'DevicesIgnitionOff'
process.env.DRIVER_USER_TABLE = 'driver-backend-driverUserTable-WO9H2QY2KTV8'

const devices = require('../../src/devices')
devices.devicesGet(undefined,
  { locals: { user: { username: 'l.jopia' } }, json: (j) => console.log(j) }).then(r => console.log(r))

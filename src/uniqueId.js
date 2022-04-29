exports.get = async (driverId) => {
    return [{id: 1,
        driverid: '7471',
        uniqueid: '1234',
        start: new Date(2022, 0, 10, 10, 0, 0, 0),
        end: new Date(2022, 3, 10, 10, 0, 0, 0)},
        {id: 1,
            driverid: '7471',
            uniqueid: '4321',
            start: new Date(2022, 3, 10, 10, 0, 0, 0),
        }
    ]
}

exports.add = async (data) => {
    return 'OK'
}

exports.update = async (data) => {
    return 'OK'
}

exports.delete = async (data) => {
    return 'OK'
}

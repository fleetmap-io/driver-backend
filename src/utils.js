exports.logError = async (e, req, ...args) => {
    try {
        console.error(...args, e.message,
            e.response && e.response.data, (e.config && e.config.url) || e,
            (await getCity(req.headers['x-forwarded-for'].split(',')[0])).region)
    } catch (e) {
        console.error(e)
    }
}

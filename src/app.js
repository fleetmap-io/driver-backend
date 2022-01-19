const CognitoExpress = require("cognito-express")
const express = require('express')

const cognitoExpress = new CognitoExpress({
    region: "us-east-1",
    cognitoUserPoolId: process.env.COGNITO_USER_POOOL_ID,
    tokenUse: "access", //Possible Values: access | id
    tokenExpiration: 3600000 //Up to default expiration of 1 hour (3600000 ms)
})


const app = new express()
// noinspection JSCheckFunctionSignatures
app.use(require('cors')())

app.use(async function(req, res, next) {

    //I'm passing in the access token in header under key accessToken
    let accessTokenFromClient = req.headers.authorization;

    //Fail if token not present in header.
    if (!accessTokenFromClient) return res.status(401).send("Access Token missing from header")

    await cognitoExpress.validate(accessTokenFromClient.replace('Bearer ',''), function (err, response) {

        //If API is not authenticated, Return 401 with error message.
        if (err) return res.status(401).send(err);

        //Else API has been authenticated. Proceed.
        res.locals.user = response;
        next();
    })
})


app.get('*', (req, resp) => {
    console.log(resp.local.user)
    resp.json({statusCode: 200})
})

module.exports = app

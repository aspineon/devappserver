    "use strict";

    var proxy = require('express-http-proxy');
    var express = require('express');
    var fs = require('fs');
    var urlParse = require('url');
    var config = require('./config.json');

    process.env.PORT = process.env.PORT || config.port;

    var app = module.exports.app = exports.app = express();
    /*
    Middleware sequence for API calls:
        - Forward to log function if logging is enabled
        - Forward to checkForMock: return json mock from server/mockresponse if corresponding json exists
        - If not, proxy to apiAddress
     */

    if(config.logRequests) {
        app.use(config.apiRoute, log);
    }

    app.use(config.apiRoute, checkForMock);

    app.use(config.apiRoute, proxy(config.apiAddress, {
        forwardPath: function(req, res) {
            var url = urlParse.parse(req.originalUrl).path;
            console.log('Proxy' + ' ' + url);
            return url;
        }
    }));

    app.use(express.static(config.staticDir));

    app.use(function(err, req, res, next) {
        if(err.code === 'ECONNREFUSED') {
            res.status(502).send('Bad Gateway: connection refused by server at ' + apiAddress);
            res.end();
        }
    });

    app.listen(process.env.PORT);

    function log(req, res, next) {
        console.log(req.originalUrl);
        next();
    }

    function checkForMock(req, res, next) {
        var fileName = req.originalUrl;
        config.replace.forEach(function(e) {
            var re = new RegExp(e.pattern, "g");
            fileName = fileName.replace(re, e.replace);
        });

        fileName = fileName.replace(/\//g, '-') + '.json';

        console.log(fileName);

        var response = readFile(fileName);

        if(response) {
            console.log('Serving mock ' + fileName + ' for url ' + req.originalUrl);
            res.status(200);
            res.send(response);
            res.end();
        }
        else {
            next();
        }
    }

    function readFile(fileName) {
        try {
            fileName = config.mockDir + fileName;
            var response = fs.readFileSync(fileName, {encoding: 'utf8'});

            return response;
        }
        catch(exception) {
            if(exception.code === 'ENOENT') {
                console.log('File '+ fileName + ' not found');
            }
            else {
                console.log(exception);
            }

            return null;
        }
    }

    console.log('Listening on port ' + process.env.PORT + '.');
    console.log('Ctrl+C to shut down.');
// Copyright 2015, EMC, Inc.

'use strict';

var express = require('express');
var directory = require("serve-index");
var cors = require('cors');
var http = require('http');
var bodyParser = require('body-parser');
var ws = require('nodejs-websocket');
var wsConn;

var address = '0.0.0.0';
var httpPort = 3000;
var wsPort = 9100;

var wsServer = ws.createServer(function(conn){
    console.log("webSocket server created");

    wsConn = conn;

    conn.on('connect', function(something){
        console.log("webSocket connected", conn, something);
    });

    conn.on('text', function(str){
        console.log("webSocket text message received", str);
        // conn.sendText(JSON.stringify({"message": "hello stranger"}));
    });

    conn.on('close', function(code, reason){
        console.log("webSocket connection closed", code, reason);
    });
}).listen(wsPort, address, function(err){
    if(err){
        console.log("error create webSocket server", err);
    } else{
        console.log("webSocket server listening on", address, wsPort);
    }
});

var app = express();
app.use(cors());
app.options('*', cors());

// Parse request body. Limit set to 50MB
app.use(bodyParser.json({ limit: '50mb' }));

//static file server
app.use('/', express.static('./static', {dotfiles: 'allow'}));
app.use('/', directory('./static',
    {
        'icons': 'true',
        'hidden': 'true'
    }
));

app.get('/webhook', function(req, res){
    console.log('getting /webhook');
    res.send('hello from get_webhook\n');
    if(wsConn){
        console.log('sending ws message');
        wsConn.send(JSON.stringify(
            {
                "createdAt": "2016-12-27T17:56:52.562Z",
                "type": "graph",
                "typeId": "b5fbf33c-417d-4c4f-81ad-b9d18acac9f9",
                "nodeId": "58542c752be86d0672cef383",
                "action": "finished",
                "data": "this is fake data"
            }
        ));
    }
});

app.post('/webhook', function(req, res){
    console.log('posting /webhook');
    var body = req.body || {};
    res.send('hello from get_webhook\n');
    if(wsConn){
        console.log('sending ws message');
        wsConn.send(JSON.stringify(
            {
                "createdAt": "2016-12-27T17:56:52.562Z",
                "type": "graph",
                "typeId": "b5fbf33c-417d-4c4f-81ad-b9d18acac9f9",
                "nodeId": "58542c752be86d0672cef383",
                "action": "finished",
                "data": body
            }
        ));
    }
});

var httpServer = http.createServer(app);

httpServer.on('close', function(){
    console.log('http server started');
});

httpServer.on('connection', function(){
    console.log('http server connected');
});

httpServer.listen(httpPort, address, function(err){
    if(err){
        console.log('http server listen error', err);
        return;
    } else {
        console.log('http server listening on: ', address, httpPort);
        httpServer.timeout = 86400000;
    }
});

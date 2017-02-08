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

app.post('/webhook', function(req, res){
    console.log('posting /webhook', {msg: req.body});
    var body = req.body || {};
    res.send('hello from post_webhook\n');
    if(wsConn){
        console.log('sending ws message');
        wsConn.send(JSON.stringify(req.body));
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

"use strict";

const { HeyChainClient } = require('./nodeclient');
const { HeyChainServ } = require('./nodeserv');
const async = require('async');

class HeyChainNode {
    constructor(servaddr, nodetype) {
        this.serv = new HeyChainServ(servaddr, nodetype);
        this.serv.funcOnHey = (servaddr) => {
            if (this.mapClient_ServAddr[servaddr]) {
                return ;
            }

            this._newClient(servaddr);
        }

        this.mapClient_ServAddr = {};
    }

    _newClient(servaddr) {
        console.log('new client ' + servaddr);

        let client = new HeyChainClient(servaddr);
        client.start();
        this.mapClient_ServAddr[servaddr] = client;

        client.requestHey(this.serv.prikey, this.serv.nodetype, 
            this.serv.servaddr, (msg) => {
                if (this.mapClient_ServAddr[msg.servAddr]) {
                    return ;
                }

                this._newClient(msg.servAddr);
        });        
    }

    start(lstservaddr) {
        this.serv.start();

        for (let i = 0; i < lstservaddr.length; ++i) {
            this._newClient(lstservaddr[i]);
        }

        // async.eachSeries(lstservaddr, function(servaddr, next) {  
        //     let client = new NodeClient(lstservaddr[i]);
        //     client.requestHey((lst) => {
        //         next();
        //     });
        // }, function(err){  
        //     callback();
        // });
    }
}

exports.HeyChainNode = HeyChainNode;
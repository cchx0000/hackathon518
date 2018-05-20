"use strict";

const { RpcClient } = require('./grpcclient');
const { proto } = require('./proto');

class HeyChainClient extends RpcClient {
    constructor(servaddr) {
        super(servaddr, 
            proto, 
            'heychain', 
            'HeyService');

        this.callTrade = undefined;
    }

    requestHey(prikey, nodetype, servaddr, callback) {
        var call = this.client.hey({
            addr: prikey,
            nodeType: nodetype,
            servAddr: servaddr
        });

        call.on('error', () => {
            setTimeout(() => {
                this.requestHey(prikey, nodetype, servaddr, callback);
            }, 3 * 1000);
        });
        
        call.on('data', (msg) => {
            if (msg.servAddr != servaddr && msg.servAddr != this.servaddr) {
                callback({
                    addr: prikey,
                    nodeType: nodetype,
                    servAddr: servaddr
                });
            }
        });
    }

    startTrade(symbol0, symbol1, price, valume) {
        this.callTrade = this.client.hey({
            addr: prikey,
            nodeType: nodetype,
            servAddr: servaddr
        });

        call.on('error', () => {
            setTimeout(() => {
                this.requestHey(prikey, nodetype, servaddr, callback);
            }, 3 * 1000);
        });
        
        call.on('data', (msg) => {
            if (msg.servAddr != servaddr && msg.servAddr != this.servaddr) {
                callback({
                    addr: prikey,
                    nodeType: nodetype,
                    servAddr: servaddr
                });
            }
        });
    }

    newOrder(symbol0, symbol1, price, valume, callback) {
    }
};

exports.HeyChainClient = HeyChainClient;
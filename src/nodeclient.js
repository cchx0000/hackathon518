"use strict";

const { RpcClient } = require('./grpcclient');
const { proto } = require('./proto');

class HeyChainClient extends RpcClient {
    constructor(servaddr) {
        super(servaddr, 
            proto, 
            'heychain', 
            'HeyService', 
            {'hey': (call) => { this.hey(call); }});
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
};

exports.HeyChainClient = HeyChainClient;
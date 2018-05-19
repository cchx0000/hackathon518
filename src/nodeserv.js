"use strict";

const { RpcServ } = require('./grpcserv');
const { genPriKey } = require('./utils');
const { proto } = require('./proto');

class HeyChainServ extends RpcServ {
    constructor(servaddr, nodetype) {
        super(servaddr, 
            proto, 
            'heychain', 
            'HeyService', 
            {'hey': (call) => { this.hey(call); }});

        this.nodeType = nodetype;
        this.mapNode = {};
        this.prikey = genPriKey();    

        this.funcOnHey = undefined;
    }

    hey(call) {
        console.log('new connect ' + call.request.servAddr);

        if (this.funcOnHey) {
            this.funcOnHey(call.request.servAddr);
        }

        for (let addr in this.mapNode) {
            let cn = this.mapNode[addr];
            call.write({                
                addr: cn.adr, 
                nodeType: cn.nodeType,
                servAddr: cn.servAddr
            });

            cn.callHey.write({
                addr: call.request.adr, 
                nodeType: call.request.nodeType,
                servAddr: call.request.servAddr,                
            });
        }

        call.write({                
            addr: this.prikey, 
            nodeType: this.nodeType,
            servAddr: this.servaddr
        });

        this.mapNode[call.addr] = {
            addr: call.request.adr, 
            nodeType: call.request.nodeType,
            servAddr: call.request.servAddr,
            callHey: call
        };

        // call.end();
    }
};

exports.HeyChainServ = HeyChainServ;
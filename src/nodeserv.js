"use strict";

const { RpcServ } = require('./grpcserv');
const { genPriKey } = require('./utils');
const { proto } = require('./proto');
const { ORDERSIDE } = require('./basedef');

class HeyChainServ extends RpcServ {
    constructor(servaddr, nodetype) {
        super(servaddr, 
            proto, 
            'heychain', 
            'HeyService', 
            {
                hey: (call) => { this.hey(call); },
                requestChannels: (call) => { this.requestChannels(call); },
                newOrder: (call) => { this.newOrder(call); }
            });

        this.nodeType = nodetype;
        this.mapNode = {};
        this.prikey = genPriKey();    

        this.funcOnHey = undefined;
        this.funcOnChannel = undefined;
        this.funcOnNewOrder = undefined;
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

        this.mapNode[call.request.addr] = {
            addr: call.request.adr, 
            nodeType: call.request.nodeType,
            servAddr: call.request.servAddr,
            callHey: call,
            callChannel: undefined,
            callNewOrder: undefined,
        };

        // call.end();
    }

    requestChannels(call) {
        call.on('data', (msg) => {
            console.log('new request channel ' + msg.addr);

            if (this.mapNode[msg.addr]) {
                this.mapNode[msg.addr].callChannel = call;
            }

            if (this.funcOnChannel) {
                this.funcOnChannel(msg.symbol0, msg.symbol1, msg.channel, msg.addr);
            }
        });
        call.on('end', function() {
            call.end();
        });
    }

    sendChannel(addr, msg) {
        if (this.mapNode[addr] && this.mapNode[addr].callChannel) {
            this.mapNode[addr].callChannel.write(msg);
        }
    }

    newOrder(call) {
        call.on('data', (msg) => {
            console.log('new order ' + msg.price + ' ' + msg.volume + ' ' + msg.orderType);

            if (this.mapNode[msg.addr]) {
                this.mapNode[msg.addr].callNewOrder = call;
            }

            if (this.funcOnChannel) {
                this.funcOnNewOrder(msg.addr,
                    msg.symbol0, msg.symbol1,
                    msg.clientOrderId, msg.orderType == 'ask' ? ORDERSIDE.ASK : ORDERSIDE.BID,
                    parseInt(msg.price), parseInt(msg.volume));
            }
        });
        call.on('end', function() {
            call.end();
        });
    }

    sendOrderUpd(addr, msg) {
        if (this.mapNode[addr] && this.mapNode[addr].callNewOrder) {
            this.mapNode[addr].callNewOrder.write(msg);
        }
    }
};

exports.HeyChainServ = HeyChainServ;
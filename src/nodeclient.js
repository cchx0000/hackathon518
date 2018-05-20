"use strict";

const { RpcClient } = require('./grpcclient');
const { proto } = require('./proto');
const { ORDERSIDE } = require('./basedef');

class HeyChainClient extends RpcClient {
    constructor(servaddr) {
        super(servaddr, 
            proto, 
            'heychain', 
            'HeyService');

        this.callTrade = undefined;
        this.callChannel = undefined;

        this.funcOnChannel = undefined;
        this.funcOnOrderUpd = undefined;
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
            else {
                callback(undefined);
            }
        });
    }

    startTrade() {
        this.callTrade = this.client.newOrder();

        this.callTrade.on('error', (err) => {
            setTimeout(() => {
                this.startTrade();
            }, 3 * 1000);
        });

        this.callTrade.on('data', (msg) => {
            if (this.funcOnOrderUpd) {
                this.funcOnOrderUpd(msg);
            }
        });
    }

    newOrder(addr, symbol0, symbol1, side, orderId, price, volume) {
        if (!this.callTrade) {
            this.startTrade();
        }

        this.callTrade.write({
            symbol0: symbol0,
            symbol1: symbol1,
            price: price,
            volume: volume,
            clientOrderId: orderId.toString(),
            orderType: side == ORDERSIDE.ASK ? 'ask' : 'bid',
            addr: addr
        });
    }

    startChannel() {
        this.callChannel = this.client.requestChannels();

        this.callChannel.on('error', (err) => {
            setTimeout(() => {
                this.startChannel();
            }, 3 * 1000);
        });

        this.callChannel.on('data', (msg) => {
            if (this.funcOnChannel) {
                this.funcOnChannel(msg);
            }
        });
    }

    addChannel(addr, symbol0, symbol1, channel, onData) {
        if (!this.callChannel) {
            this.startChannel();
        }

        this.callChannel.write({
            symbol0: symbol0,
            symbol1: symbol1,
            channel: channel,
            addr: addr
        });
    }
};

exports.HeyChainClient = HeyChainClient;
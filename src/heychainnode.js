"use strict";

const { HeyChainClient } = require('./nodeclient');
const { HeyChainServ } = require('./nodeserv');
const { proto } = require('./proto');
const { Market } = require('./market');
const async = require('async');

class HeyChainNode {
    constructor(servaddr, nodetype) {
        this.serv = new HeyChainServ(servaddr, nodetype);
        this.mapClient_ServAddr = {};

        if (nodetype == proto.heychain.NODETYPE.MARKET) {
            this.market = new Market();
        }

        this.serv.funcOnHey = (servaddr) => {
            if (this.mapClient_ServAddr[servaddr]) {
                return ;
            }

            this._newClient(servaddr);
        }

        this.serv.funcOnChannel = (symbol0, symbol1, channel, addr) => {
            if (this.market) {
                this.market.onChannel(symbol0, symbol1, channel, addr);
            }
        }

        this.serv.funcOnNewOrder = (addr, symbol0, symbol1, orderId, side, price, volume) => {
            this.onNewOrder(addr, symbol0, symbol1, orderId, side, price, volume);
        }
    }

    _newClient(servaddr) {
        console.log('new client ' + servaddr);

        let client = new HeyChainClient(servaddr);
        client.start();
        this.mapClient_ServAddr[servaddr] = client;

        client.requestHey(this.serv.prikey, this.serv.nodetype, 
            this.serv.servaddr, (msg) => {
            if (msg == undefined) {
                return ;
            }

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

    onNewOrder(addr, symbol0, symbol1, orderId, side, price, volume) {
        if (this.market) {
            this.market.onNewOrder(this.serv, addr, symbol0, symbol1, orderId, side, price, volume, 
                (orderside, orderprice, ordervolume) => {
                    this.market.onDepth(this.serv, symbol0, symbol1, orderside, orderprice, ordervolume);
                }, (curorder) => {
                    this.serv.sendOrderUpd(curorder.addr, {
                        clientOrderId: curorder.orderId,
                        symbol0: symbol0,
                        symbol1: symbol1,
                        avgPrice: curorder.avgPrice,
                        lastVolume: curorder.volume
                    });
                });
        }
    }
}

exports.HeyChainNode = HeyChainNode;
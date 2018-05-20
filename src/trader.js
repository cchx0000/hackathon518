"use strict";

const { Channel } = require('./channel');
const { OrderBook } = require('./orderbook');
const { ORDERSIDE } = require('./basedef');

class Trader {
    constructor(symbol0, symbol1) {
        this.symbol0 = symbol0;
        this.symbol1 = symbol1;

        this.dealPrice = 100;

        // this.myOrder = undefined;
        this.myOrderId = 1;
    }

    onDeal(price) {
        this.dealPrice = parseInt(price);
    }

    newOrder(client, addr) {
        // if (this.myOrder) {
        //     return ;
        // }

        let gp = this.dealPrice + Math.floor(Math.random() * 10) - 5;
        if (gp <= 50) {
            gp = 100;
        }

        if (Math.floor(Math.random() * 100) < 50) {
            client.newOrder(addr, this.symbol0, this.symbol1, ORDERSIDE.ASK, this.myOrderId, gp, Math.floor(Math.random() * 10) + 1);
        }
        else {
            client.newOrder(addr, this.symbol0, this.symbol1, ORDERSIDE.BID, this.myOrderId, gp, Math.floor(Math.random() * 10) + 1);
        }
    }
};

exports.Trader = Trader;
"use strict";

const { Channel } = require('./channel');
const { OrderBook } = require('./orderbook');
const { ORDERSIDE } = require('./basedef');

class Trader {
    constructor(symbol0, symbol1) {
        this.symbol0 = symbol0;
        this.symbol1 = symbol1;

        this.dealPrice = -1;

        this.myOrder = undefined;
        this.myOrderId = 1;
    }

    onDeal(price) {
        this.dealPrice = price;
    }

    newOrder(client, addr) {
        if (this.myOrder) {
            return ;
        }

        client.newOrder(addr, this.symbol0, this.symbol1, ORDERSIDE.ASK, this.myOrderId, 100, 1);
        client.newOrder(addr, this.symbol0, this.symbol1, ORDERSIDE.BID, this.myOrderId, 100, 1);
    }
};

exports.Trader = Trader;
"use strict";

const { Channel } = require('./channel');
const { OrderBook } = require('./orderbook');
const { ORDERSIDE } = require('./basedef');

class Market {
    constructor() {
        this.mapChannel_depth = new Channel();
        this.mapChannel_deal = new Channel();

        this.mapOrderBook = {};
    }

    onChannel(symbol0, symbol1, channel, addr) {
        if (channel == 'depth') {
            this.mapChannel_depth.addNode(symbol0, symbol1, addr);
        }
        else if (channel == 'deal') {
            this.mapChannel_deal.addNode(symbol0, symbol1, addr);
        }
    }

    onDepth(serv, symbol0, symbol1, orderside, price, volume) {
        this.mapChannel_depth.broadcast(serv, symbol0, symbol1, {
            symbol0: symbol0,
            symbol1: symbol1,
            channel: 'depth',
            orderbook: {
                price: price,
                volume: volume,
                side: orderside == ORDERSIDE.ASK ? 'ask' : 'bid'
            }
        });
    }

    onDeal(serv, symbol0, symbol1, orderside, price, volume) {
        console.log('deal ' + price + ' ' + volume);
        this.mapChannel_deal.broadcast(serv, symbol0, symbol1, {
            symbol0: symbol0,
            symbol1: symbol1,
            channel: 'deal',
            deal: {
                price: price,
                volume: volume,
                side: orderside == ORDERSIDE.ASK ? 'ask' : 'bid'
            }
        });
    }

    getOrderBook(symbol0, symbol1) {
        let ckey = symbol0 + symbol1;
        if (!this.mapOrderBook[ckey]) {
            this.mapOrderBook[ckey] = new OrderBook();
        }

        return this.mapOrderBook[ckey];
    }

    onNewOrder(serv, addr, symbol0, symbol1, orderId, side, price, volume, funcOnDepth, funcOnDeal) {
        let ob = this.getOrderBook(symbol0, symbol1);

        ob.onNewOrder(addr, orderId, side, price, volume, funcOnDepth, (curorder) => {
            this.onDeal(serv, symbol0, symbol1, curorder.orderside, curorder.curPrice, curorder.curVolume);
            if (funcOnDeal) {
                funcOnDeal(curorder);
            }
        });
    }
};

exports.Market = Market;
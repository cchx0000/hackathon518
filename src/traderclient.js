"use strict";

const { HeyChainClient } = require('./nodeclient');
const { genPriKey } = require('./utils');
const { proto } = require('./proto');
const { Trader } = require('./trader');

class TraderClient {
    constructor(symbol0, symbol1) {
        this.symbol0 = symbol0;
        this.symbol1 = symbol1;

        this.client = undefined;
        this.trader = new Trader(symbol0, symbol1);

        this.prikey = genPriKey();
    }

    start(servaddr) {
        this.client = new HeyChainClient(servaddr);
        this.client.start();

        this.client.funcOnChannel = (msg) => {
            if (msg.channel == 'deal') {
                this.trader.onDeal(msg.deal.price);
            }
        };

        this.client.funcOnOrderUpd = (msg) => {

        };

        this.client.requestHey(this.prikey, proto.heychain.NODETYPE.TRADER, '', (msg) => {
            this.client.addChannel(this.prikey, this.symbol0, this.symbol1, 'deal', (msg) => {});
        });
        // this.client.addChannel(this.prikey, this.symbol0, this.symbol1, 'depth', (msg) => {});
        // this.client.addChannel(this.prikey, this.symbol0, this.symbol1, 'deal', (msg) => {});

        setInterval(() => {
            this.trader.newOrder(this.client, this.prikey);

        }, 3 * 1000);
    }
}

exports.TraderClient = TraderClient;
"use strict";

class Channel {
    constructor() {
        this.map = {};
    }

    addNode(symbol0, symbol1, addr) {
        let ck = symbol0 + symbol1;
        if (!this.map[ck]) {
            this.map[ck] = {};
        }

        this.map[ck][addr] = {addr: addr};
    }

    broadcast(serv, symbol0, symbol1, msg) {
        let ck = symbol0 + symbol1;
        if (!this.map[ck]) {
            return ;
        }

        for (let addr in this.map[ck]) {
            let cn = this.map[ck][addr];
            serv.sendChannel(addr, msg);
        }
    }
};

exports.Channel = Channel;
"use strict";

const { ORDERSIDE } = require('./basedef');

class OrderBook {
    constructor() {
        this.lstAsks = [];
        this.lstBids = [];
    }

    onNewOrder(addr, orderId, side, price, volume, callback, funcOnDeal) {
        if (side == ORDERSIDE.ASK) {
            let ret = this._checkDeal_bid(addr, orderId, price, volume, callback);
            if (ret.volume > 0) {
                this._insAsks(addr, orderId, price, volume, ret.avgPrice, ret.dealVolume, callback);
            }
        }
        else if (side == ORDERSIDE.BID) {
            let ret = this._checkDeal_ask(addr, orderId, price, volume, callback, funcOnDeal);
            if (ret.volume > 0) {
                this._insBids(addr, orderId, price, volume, ret.avgPrice, ret.dealVolume, callback);
            }
        }
    }

    _onDeal_ask(curnode, addr, price, volume, avgPrice, dealVolume, funcOnDeal) {
        let lstchild = curnode.lst;
        for (let i = 0; i < lstchild.length; ) {
            let cn = lstchild[i];
            let cv = 0;

            if (cn.volume <= volume) {
                cv = cn.volume;
            }
            else {
                cv = volume;
            }

            let askorder = {
                orderside: ORDERSIDE.ASK,
                addr: cn.addr,
                orderId: cn.orderId,
                avgPrice: Math.floor((cn.avgPrice * cn.dealVolume + price * cv) / (cn.dealVolume + cv)),
                dealVolume: cv + cn.dealVolume,
                volume: cn.volume - cv,
                curPrice: price,
                curVolume: cv
            };

            avgPrice = Math.floor((avgPrice * dealVolume + price * cv) / (dealVolume + cv));
            dealVolume = cv + dealVolume;

            funcOnDeal(askorder);

            volume -= cv;

            cn.avgPrice = askorder.avgPrice;
            cn.volume -= cv;
            cn.dealVolume = askorder.dealVolume;

            curnode.totalvolume -= cv;

            if (cn.volume <= 0) {
                lstchild.splice(i, 1);
            }

            if (volume <= 0) {
                return {
                    volume: volume, 
                    avgPrice: avgPrice, 
                    dealVolume: dealVolume
                };
            }
        }

        return {
            volume: volume, 
            avgPrice: avgPrice, 
            dealVolume: dealVolume
        };
    }

    _checkDeal_ask(addr, orderId, price, volume, callback, funcOnDeal) {
        if (this.lstAsks.length <= 0) {
            return {
                volume: volume,
                avgPrice: 0,
                dealVolume: 0
            };
        }

        if (price < this.lstAsks[0].price) {
            return {
                volume: volume,
                avgPrice: 0,
                dealVolume: 0
            };
        }

        let avgPrice = 0;
        let dealVolume = 0;

        for (let i = 0; i < this.lstAsks.length; ++i) {
            let cn = this.lstAsks[i];
            if (price >= cn.price) {
                let ret = this._onDeal_ask(cn, addr, price, volume, avgPrice, dealVolume, funcOnDeal);
                avgPrice = ret.avgPrice;
                dealVolume = ret.dealVolume;
                volume = ret.volume;

                if (volume <= 0) {
                    let bidorder = {
                        orderside: ORDERSIDE.BID,
                        addr: addr,
                        orderId: orderId,
                        avgPrice: avgPrice,
                        dealVolume: dealVolume,
                        volume: 0,
                        curPrice: price,
                        curVolume: dealVolume
                    };
        
                    funcOnDeal(bidorder);

                    return {
                        volume: volume,
                        avgPrice: avgPrice,
                        dealVolume: dealVolume
                    };
                }
            }
        }

        if (dealVolume > 0) {
            let bidorder = {
                orderside: ORDERSIDE.BID,
                addr: addr,
                orderId: orderId,
                avgPrice: avgPrice,
                dealVolume: dealVolume,
                volume: volume,
                curPrice: price,
                curVolume: dealVolume
            };

            funcOnDeal(bidorder);
        }

        return {
            volume: volume,
            avgPrice: avgPrice,
            dealVolume: dealVolume
        };
    }

    _onDeal_ask(curnode, addr, price, volume, avgPrice, dealVolume, funcOnDeal) {
        let lstchild = curnode.lst;
        for (let i = 0; i < lstchild.length; ) {
            let cn = lstchild[i];
            let cv = 0;

            if (cn.volume <= volume) {
                cv = cn.volume;
            }
            else {
                cv = volume;
            }

            let bidorder = {
                orderside: ORDERSIDE.BID,
                addr: cn.addr,
                orderId: cn.orderId,
                avgPrice: Math.floor((cn.avgPrice * cn.dealVolume + price * cv) / (cn.dealVolume + cv)),
                dealVolume: cv + cn.dealVolume,
                volume: cn.volume - cv,
                curPrice: price,
                curVolume: cv
            };

            avgPrice = Math.floor((avgPrice * dealVolume + price * cv) / (dealVolume + cv));
            dealVolume = cv + dealVolume;

            funcOnDeal(bidorder);

            volume -= cv;

            cn.avgPrice = bidorder.avgPrice;
            cn.volume -= cv;
            cn.dealVolume = bidorder.dealVolume;

            curnode.totalvolume -= cv;

            if (cn.volume <= 0) {
                lstchild.splice(i, 1);
            }

            if (volume <= 0) {
                return {
                    volume: volume, 
                    avgPrice: avgPrice, 
                    dealVolume: dealVolume
                };
            }
        }

        return {
            volume: volume, 
            avgPrice: avgPrice, 
            dealVolume: dealVolume
        };
    }

    _checkDeal_bid(addr, orderId, price, volume, callback, funcOnDeal) {
        if (this.lstBids.length <= 0) {
            return {
                volume: volume,
                avgPrice: 0,
                dealVolume: 0
            };
        }

        if (price > this.lstBids[0].price) {
            return {
                volume: volume,
                avgPrice: 0,
                dealVolume: 0
            };
        }

        let avgPrice = 0;
        let dealVolume = 0;

        for (let i = 0; i < this.lstBids.length; ++i) {
            let cn = this.lstBids[i];
            if (price <= cn.price) {
                let ret = this._onDeal_bid(cn, addr, price, volume, avgPrice, dealVolume, funcOnDeal);
                avgPrice = ret.avgPrice;
                dealVolume = ret.dealVolume;
                volume = ret.volume;

                if (volume <= 0) {
                    let askorder = {
                        orderside: ORDERSIDE.ASK,
                        addr: addr,
                        orderId: orderId,
                        avgPrice: avgPrice,
                        dealVolume: dealVolume,
                        volume: 0,
                        curPrice: price,
                        curVolume: dealVolume
                    };
        
                    funcOnDeal(askorder);

                    return {
                        volume: volume,
                        avgPrice: avgPrice,
                        dealVolume: dealVolume
                    };
                }
            }
        }

        if (dealVolume > 0) {
            let askorder = {
                orderside: ORDERSIDE.ASK,
                addr: addr,
                orderId: orderId,
                avgPrice: avgPrice,
                dealVolume: dealVolume,
                volume: volume,
                curPrice: price,
                curVolume: dealVolume
            };

            funcOnDeal(askorder);
        }

        return {
            volume: volume,
            avgPrice: avgPrice,
            dealVolume: dealVolume
        };
    }

    _insChildList(lstchild, addr, orderId, price, volume, avgPrice, dealVolume) {
        lstchild.push({
            addr: addr,
            orderId: orderId,
            price: price,
            volume: volume,
            avgPrice: avgPrice,
            dealVolume: dealVolume
        });
    }

    _insAsks(addr, orderId, price, volume, avgPrice, dealVolume, callback) {
        for (let i = 0; i < this.lstAsks.length; ++i) {
            let cn = this.lstAsks[i];
            if (price == cn.price) {
                cn.totalvolume += volume;
                this._insChildList(cn.lst, orderId, addr, price, volume, avgPrice, dealVolume);

                callback(ORDERSIDE.ASK, price, cn.totalvolume);

                return ;
            }

            if (price < cn.price) {
                this.lstAsks.splice(i, 0, {
                    price: price,
                    totalvolume: volume,
                    lst: [
                        {
                            addr: addr,
                            orderId: orderId,
                            price: price,
                            volume: volume,
                            avgPrice: avgPrice,
                            dealVolume: dealVolume
                        }
                    ]
                });

                callback(ORDERSIDE.ASK, price, volume);

                return ;
            }
        }

        this.lstAsks.push({
            price: price,
            totalvolume: volume,
            lst: [
                {
                    addr: addr,
                    orderId: orderId,
                    price: price,
                    volume: volume,
                    avgPrice: avgPrice,
                    dealVolume: dealVolume
                }
            ]
        });

        callback(ORDERSIDE.ASK, price, volume);
    }

    _insBids(addr, orderId, price, volume, avgPrice, dealVolume, callback) {
        for (let i = 0; i < this.lstBids.length; ++i) {
            let cn = this.lstBids[i];
            if (price == cn.price) {
                cn.totalvolume += volume;
                this._insChildList(cn.lst, addr, price, volume, avgPrice, dealVolume);

                callback(ORDERSIDE.BID, price, cn.totalvolume);

                return ;
            }

            if (price > cn.price) {
                this.lstBids.splice(i, 0, {
                    price: price,
                    totalvolume: volume,
                    lst: [
                        {
                            addr: addr,
                            orderId: orderId,
                            price: price,
                            volume: volume,
                            avgPrice: avgPrice,
                            dealVolume: dealVolume
                        }
                    ]
                });

                callback(ORDERSIDE.BID, price, volume);

                return ;
            }
        }

        this.lstBids.push({
            price: price,
            totalvolume: volume,
            lst: [
                {
                    addr: addr,
                    orderId: orderId,
                    price: price,
                    volume: volume,
                    avgPrice: avgPrice,
                    dealVolume: dealVolume
                }
            ]
        });

        callback(ORDERSIDE.BID, price, volume);
    }
};

exports.OrderBook = OrderBook;
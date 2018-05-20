"use strict";

const { TraderClient } = require('../src/traderclient');
const { proto } = require('../src/proto');

var client = new TraderClient('BTC', 'USDT');
client.start('0.0.0.0:7000');
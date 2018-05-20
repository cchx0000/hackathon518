"use strict";

const { HeyChainNode } = require('../src/heychainnode');
const { proto } = require('../src/proto');

var serv = new HeyChainNode('0.0.0.0:7000', proto.heychain.NODETYPE.MARKET);
serv.start([]);
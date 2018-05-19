"use strict";

const { HeyChainNode } = require('../src/heychainnode');
const { proto } = require('../src/proto');

var serv = new HeyChainNode('0.0.0.0:7001', proto.heychain.NODETYPE.TRADER);
serv.start(['0.0.0.0:7000']);
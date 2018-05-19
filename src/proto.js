"use strict";

const grpc = require('grpc');

exports.proto = grpc.load(__dirname + '/../proto/heychain.proto');
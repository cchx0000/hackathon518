"use strict";

const grpc = require('grpc');

class RpcClient {
    constructor(servaddr, proto, protopackage, servicename) {
        this.servaddr = servaddr;
        this.servicename = servicename;
        this.protoPackage = proto[protopackage];
    }

    start() {
        this.client = new this.protoPackage[this.servicename](this.servaddr, grpc.credentials.createInsecure());
        // this.client['$channel'].on('error', () => {
        //     console.log('error');
        // });
    }
};

exports.RpcClient = RpcClient;
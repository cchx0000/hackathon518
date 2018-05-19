"use strict";

const grpc = require('grpc');

class RpcServ {
    constructor(servaddr, proto, protopackage, servicename, binding) {
        this.servaddr = servaddr;
        this.servicename = servicename;
        this.binding = binding;
        this.protoPackage = proto[protopackage];
    }

    start() {
        this.serv = new grpc.Server();
        this.serv.addService(this.protoPackage[this.servicename].service, this.binding);
        this.serv.bind(this.servaddr, grpc.ServerCredentials.createInsecure());
        this.serv.start();
    }
};

exports.RpcServ = RpcServ;
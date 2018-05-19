"use strict";

const libbitcoincrypo = require('libbitcoincrypo');

const HEXSTR = '0123456789abcdef';

function outputUint8Arr(ui8arr) {
    let str = '';
    for (let i = 0; i < ui8arr.length; ++i) {
        let h = Math.floor(ui8arr[i] / 16);
        let l = ui8arr[i] % 16;
        str += HEXSTR[h];
        str += HEXSTR[l];
    }

    return str;
}

function genPriKey() {
    let prikey;
    do {
        // random buf
        let rarr = new Uint8Array(32);
        for (let i = 0; i < 32; ++i) {
            rarr[i] = Math.floor(Math.random() * 255);
        }
    
        // console.log(outputUint8Arr(rarr));
    
        // sha256 buf
        prikey = libbitcoincrypo.sha256(rarr);
        // console.log(outputUint8Arr(prikey));
    } while (!libbitcoincrypo.isValidPriKey(prikey));

    return outputUint8Arr(prikey);
}

exports.genPriKey = genPriKey;
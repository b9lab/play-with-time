"use strict";

module.exports = function(web3) {
    web3.evm = web3.evm ? web3.evm : {};

    if (typeof web3.evm.increaseTime === "undefined") {
        /**
         * @param {!number} offset. Time in milliseconds by which to advance the EVM.
         * @param {!function} callback - Node-type callback.
         */
        web3.evm.increaseTime = function(offset, callback) {
            web3.currentProvider.sendAsync(
                {
                    jsonrpc: "2.0",
                    method: "evm_increaseTime",
                    params: [ offset ],
                    id: new Date().getTime()
                },
                callback);
        };
    }
};
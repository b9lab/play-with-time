"use strict";

module.exports = function addEvmFunctions(web3) {
    web3.evm = web3.evm ? web3.evm : {};

    const providerSend = (method, params) => new Promise((resolve, reject) => {
        web3.currentProvider.send(
            {
                jsonrpc: "2.0",
                method: method,
                params: params,
                id: new Date().getTime()
            },
            (error, result) => error ? reject(error) : resolve(result.result));
    });

    if (typeof web3.evm.snapshot === "undefined") {
        web3.evm.snapshot = () => providerSend("evm_snapshot", []);
    }

    if (typeof web3.evm.revert === "undefined") {
        /**
         * @param {!number} snapshotId. The snapshot to revert.
         */
        web3.evm.revert = snapshotId => providerSend("evm_revert", [ snapshotId ]);
    }

    if (typeof web3.evm.increaseTime === "undefined") {
        /**
         * @param {!number} offset. Time in milliseconds by which to advance the EVM.
         */
        web3.evm.increaseTime = offset => providerSend("evm_increaseTime", [ offset ]);
    }

    if (typeof web3.evm.mine === "undefined") {
        web3.evm.mine = () => providerSend("evm_mine", []);
    }

};
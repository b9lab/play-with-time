"use strict";

module.exports = function(web3) {

    if (typeof web3.evm === "undefined" ||
        typeof web3.evm.snapshot === "undefined") {

        web3._extend({
            property: 'evm',
            methods: [
                new web3._extend.Method({
                    name: 'snapshot',
                    call: 'evm_snapshot',
                    params: 0,
                    outputFormatter: web3._extend.formatters.outputBigNumberFormatter
                })
            ]
        });
    }

    if (typeof web3.evm.revert === "undefined") {

        web3._extend({
            property: 'evm',
            methods: [
                new web3._extend.Method({
                    name: 'revert',
                    call: 'evm_revert',
                    params: 1
                })
            ]
        });
    }

    if (typeof web3.evm.increaseTime === "undefined") {

        web3._extend({
            property: 'evm',
            methods: [
                new web3._extend.Method({
                    name: 'increaseTime',
                    call: 'evm_increaseTime',
                    params: 1,
                    outputFormatter: web3._extend.formatters.outputBigNumberFormatter
                })
            ]
        });
    }

    if (typeof web3.evm.mine === "undefined") {

        web3._extend({
            property: 'evm',
            methods: [
                new web3._extend.Method({
                    name: 'mine',
                    call: 'evm_mine',
                    params: 0
                })
            ]
        });
    }
};
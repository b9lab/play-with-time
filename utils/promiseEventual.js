"use strict";

const promiseOperators = require("./promiseOperators.js");

module.exports = function(baseObject, promiseFunctionName) {
    baseObject[ promiseFunctionName + "Eventual" ] = function(args) {
        args.interval = args.interval ? args.interval : 500;
        args.timeout = args.timeout ? args.timeout : 30000;
        try {
            return promiseOperators.retry(
                () => baseObject[ promiseFunctionName ].apply(
                    baseObject[ promiseFunctionName ], args.passOn)
                    .then(value => {
                        if (value === null) {
                            throw new Error("value still null");
                        }
                        return value;
                    }),
                args.interval)
                .timeout(
                args.timeout,
                promiseFunctionName + " failed to return non-null after " + args.timeout);
        } catch (e) {
            return Promise.reject(e);
        }
    };
};
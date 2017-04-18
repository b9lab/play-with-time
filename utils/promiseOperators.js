"use strict";

const Q = require('q');

/**
 * @description Calls the function <code>operation</code> until it stops failing, spaced by the
 * specified <code>delay</code>.
 * @param {!function} operation
 * @param {!number} delay
 * @returns {!Promise} This promise never rejects.
 */
const retry = function(operation, delay) {
    return operation()
        .catch(() => Q
            .delay(delay)
            .then(retry.bind(null, operation, delay)));
};

module.exports = {
    retry: retry
};
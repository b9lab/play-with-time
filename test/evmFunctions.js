"use strict";

const addEvmFunctions = require("../utils/evmFunctions.js");
const chai = require('chai');
chai.should();
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

describe("EVM Functions", function() {
    let web3;

    beforeEach("should mock web3", function() {
        web3 = {
            currentProvider: {
                sendAsync: sinon.stub()
            }
        }
    });

    describe("basic setup", function() {
        it("should create evm object if absent", function() {
            assert.isUndefined(web3.evm);
            addEvmFunctions(web3);
            assert.isDefined(web3.evm);
        });

        it("should reuse evm object if present", function() {
            web3.evm = {
                pretendField: 1
            };
            addEvmFunctions(web3);
            assert.isDefined(web3.evm);
            assert.isDefined(web3.evm.increaseTime);
            assert.strictEqual(web3.evm.pretendField, 1);
        });

        it("should add increaseTime function if absent", function() {
            web3.evm = {};
            assert.isUndefined(web3.evm.increaseTime);
            addEvmFunctions(web3);
            assert.isDefined(web3.evm.increaseTime);
        });

        it("should leave increaseTime unchanged if present", function() {
            web3.evm = {
                increaseTime: "increaseTime1"
            };
            assert.isDefined(web3.evm.increaseTime);
            addEvmFunctions(web3);
            assert.strictEqual(web3.evm.increaseTime, "increaseTime1");
        });
    });

    describe("increaseTime", function() {
        beforeEach("should add EVM functions", function() {
            addEvmFunctions(web3);
        });

        it("should pass parameter along", function() {
            const callback = "callback1";
            web3.evm.increaseTime(123, callback);
            web3.currentProvider.sendAsync.should.have.been.calledOnce;
            web3.currentProvider.sendAsync.should.have.been.calledWith(
                {
                    jsonrpc: "2.0",
                    method: "evm_increaseTime",
                    params: [ 123 ],
                    id: sinon.match.number
                },
                "callback1");
        });
    });
});


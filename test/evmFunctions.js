"use strict";

let addEvmFunctions;
const Web3 = require('web3');
const chai = require('chai');
chai.should();
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require("sinon-chai");
chai.use(sinonChai);


const passes = [
    {
        title: "EVM Functions",
        getAddEvmFunctions: () => require("../utils/evmFunctions.js"),
        createWeb3: () => ({ currentProvider: {} })
    },
    {
        title: "EVM Functions 2",
        getAddEvmFunctions: () => require("../utils/evmFunctions2.js"),
        createWeb3: () => new Web3(new Web3.providers.HttpProvider())
    }
];

passes.forEach(function(pass, index) {

    describe(pass.title, function() {

        let web3;

        before("should adapt per pass", function() {
            addEvmFunctions = pass.getAddEvmFunctions();
        });

        beforeEach("should mock web3", function() {
            web3 = pass.createWeb3();
            web3.currentProvider = { sendAsync: sinon.stub() };
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

            it("should add snapshot function if absent", function() {
                web3.evm = {};
                assert.isUndefined(web3.evm.snapshot);
                addEvmFunctions(web3);
                assert.isDefined(web3.evm.snapshot);
            });

            it("should leave snapshot unchanged if present", function() {
                web3.evm = {
                    snapshot: "snapshot1"
                };
                assert.isDefined(web3.evm.snapshot);
                addEvmFunctions(web3);
                assert.strictEqual(web3.evm.snapshot, "snapshot1");
            });

            it("should add revert function if absent", function() {
                web3.evm = {};
                assert.isUndefined(web3.evm.revert);
                addEvmFunctions(web3);
                assert.isDefined(web3.evm.revert);
            });

            it("should leave revert unchanged if present", function() {
                web3.evm = {
                    revert: "revert1"
                };
                assert.isDefined(web3.evm.revert);
                addEvmFunctions(web3);
                assert.strictEqual(web3.evm.revert, "revert1");
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

            it("should add mine function if absent", function() {
                web3.evm = {};
                assert.isUndefined(web3.evm.mine);
                addEvmFunctions(web3);
                assert.isDefined(web3.evm.mine);
            });

            it("should leave mine unchanged if present", function() {
                web3.evm = {
                    mine: "mine1"
                };
                assert.isDefined(web3.evm.mine);
                addEvmFunctions(web3);
                assert.strictEqual(web3.evm.mine, "mine1");
            });
        });

        describe("snapshot", function() {
            beforeEach("should add EVM functions", function() {
                addEvmFunctions(web3);
            });

            it("should pass parameter along", function() {
                const callback = sinon.stub();
                web3.evm.snapshot(callback);
                web3.currentProvider.sendAsync.should.have.been.calledOnce;
                web3.currentProvider.sendAsync.should.have.been.calledWith(
                    {
                        jsonrpc: "2.0",
                        method: "evm_snapshot",
                        params: [],
                        id: sinon.match.number
                    },
                    sinon.match.func);
            });

            it("should return error only if error", function() {
                web3.currentProvider.sendAsync.yields("error1", "fakeResult1");
                var callback = sinon.stub();
                web3.evm.snapshot(callback);

                callback.should.have.been.calledOnce;
                callback.should.have.been.calledWith("error1", undefined);
            });

            it("should process return if ok", function() {
                web3.currentProvider.sendAsync.yields(undefined, { id: "1", result: "0x12345" });
                const callback = sinon.stub();
                web3.evm.snapshot(callback);

                callback.should.have.been.calledOnce;
                callback.should.have.been.calledWith(undefined, "0x12345");
            });
        });

        describe("revert", function() {
            beforeEach("should add EVM functions", function() {
                addEvmFunctions(web3);
            });

            it("should pass parameter along", function() {
                const callback = "callback1";
                web3.evm.revert(123, callback);
                web3.currentProvider.sendAsync.should.have.been.calledOnce;
                web3.currentProvider.sendAsync.should.have.been.calledWith(
                    {
                        jsonrpc: "2.0",
                        method: "evm_revert",
                        params: [ 123 ],
                        id: sinon.match.number
                    },
                    sinon.match.func);
            });

            it("should return error only if error", function() {
                web3.currentProvider.sendAsync.yields("error1", "fakeResult1");
                const callback = sinon.stub();
                web3.evm.revert("fakeId1", callback);

                callback.should.have.been.calledOnce;
                callback.should.have.been.calledWith("error1", undefined);
            });

            it("should process return if ok", function() {
                web3.currentProvider.sendAsync.yields(null, { result: "fakeResult1" });
                const callback = sinon.stub();
                web3.evm.revert("fakeId1", callback);

                callback.should.have.been.calledOnce;
                callback.should.have.been.calledWith(null, "fakeResult1");
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
                    sinon.match.func);
            });

            it("should return error only if error", function() {
                web3.currentProvider.sendAsync.yields("error1", "fakeResult1");
                var callback = sinon.stub();
                web3.evm.increaseTime(123, callback);

                callback.should.have.been.calledOnce;
                callback.should.have.been.calledWith("error1", undefined);
            });

            it("should process return if ok", function() {
                web3.currentProvider.sendAsync.yields(null, { result: "fakeResult1" });
                var callback = sinon.stub();
                web3.evm.increaseTime(123, callback);

                callback.should.have.been.calledOnce;
                callback.should.have.been.calledWith(null, "fakeResult1");
            });
        });

        describe("mine", function() {
            beforeEach("should add EVM functions", function() {
                addEvmFunctions(web3);
            });

            it("should pass parameter along", function() {
                const callback = "callback1";
                web3.evm.mine(callback);
                web3.currentProvider.sendAsync.should.have.been.calledOnce;
                web3.currentProvider.sendAsync.should.have.been.calledWith(
                    {
                        jsonrpc: "2.0",
                        method: "evm_mine",
                        params: [],
                        id: sinon.match.number
                    },
                    sinon.match.func);
            });

            it("should return error only if error", function() {
                web3.currentProvider.sendAsync.yields("error1", "fakeResult1");
                var callback = sinon.stub();
                web3.evm.mine(callback);

                callback.should.have.been.calledOnce;
                callback.should.have.been.calledWith("error1", undefined);
            });

            it("should process return if ok", function() {
                web3.currentProvider.sendAsync.yields(null, { result: "fakeResult1" });
                var callback = sinon.stub();
                web3.evm.mine(callback);

                callback.should.have.been.calledOnce;
                callback.should.have.been.calledWith(null, "fakeResult1");
            });
        });
    });

}, this);
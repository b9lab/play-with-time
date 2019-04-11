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
                send: sinon.stub()
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
            const received = web3.evm.snapshot();
            assert.strictEqual(typeof received.then, "function");
            web3.currentProvider.send.should.have.been.calledOnce;
            web3.currentProvider.send.should.have.been.calledWith({
                jsonrpc: "2.0",
                method: "evm_snapshot",
                params: [],
                id: sinon.match.number
            });
        });

        it("should return same if error", function(done) {
            web3.currentProvider.send.yields("error1", "fakeResult1");
            web3.evm.snapshot()
                .then(() => done("Should not have reached here"))
                .catch(error => {
                    done(error == "error1" ? undefined : "Did not pass error");
                });
        });

        it("should process return if ok", function(done) {
            web3.currentProvider.send.yields(null, { result: "fakeResult1" });
            web3.evm.snapshot()
                .then(result => done(result == "fakeResult1" ? undefined : "Did not pass result"))
                .catch(done);
        });
    });

    describe("revert", function() {
        beforeEach("should add EVM functions", function() {
            addEvmFunctions(web3);
        });

        it("should pass parameter along", function() {
            const received = web3.evm.revert(123);
            assert.strictEqual(typeof received.then, "function");
            web3.currentProvider.send.should.have.been.calledOnce;
            web3.currentProvider.send.should.have.been.calledWith({
                jsonrpc: "2.0",
                method: "evm_revert",
                params: [ 123 ],
                id: sinon.match.number
            });
        });

        it("should return same if error", function(done) {
            web3.currentProvider.send.yields("error1", "fakeResult1");
            web3.evm.revert("fakeId1")
                .then(() => done("Should not have reached here"))
                .catch(error => {
                    done(error == "error1" ? undefined : "Did not pass error");
                });
        });

        it("should process return if ok", function(done) {
            web3.currentProvider.send.yields(null, { result: "fakeResult1" });
            web3.evm.revert("fakeId1")
                .then(result => done(result == "fakeResult1" ? undefined : "Did not pass result"))
                .catch(done);
        });
    });

    describe("increaseTime", function() {
        beforeEach("should add EVM functions", function() {
            addEvmFunctions(web3);
        });

        it("should pass parameter along", function() {
            const received = web3.evm.increaseTime(123);
            web3.currentProvider.send.should.have.been.calledOnce;
            web3.currentProvider.send.should.have.been.calledWith({
                jsonrpc: "2.0",
                method: "evm_increaseTime",
                params: [ 123 ],
                id: sinon.match.number
            });
        });

        it("should return same if error", function(done) {
            web3.currentProvider.send.yields("error1", "fakeResult1");
            web3.evm.increaseTime(123)
                .then(() => done("Should not have reached here"))
                .catch(error => {
                    done(error == "error1" ? undefined : "Did not pass error");
                });
        });

        it("should process return if ok", function(done) {
            web3.currentProvider.send.yields(null, { result: "fakeResult1" });
            web3.evm.increaseTime(123)
                .then(result => done(result == "fakeResult1" ? undefined : "Did not pass result"))
                .catch(done);
        });
    });

    describe("mine", function() {
        beforeEach("should add EVM functions", function() {
            addEvmFunctions(web3);
        });

        it("should pass parameter along", function() {
            const received = web3.evm.mine();
            web3.currentProvider.send.should.have.been.calledOnce;
            web3.currentProvider.send.should.have.been.calledWith({
                jsonrpc: "2.0",
                method: "evm_mine",
                params: [],
                id: sinon.match.number
            });
        });

        it("should return same if error", function(done) {
            web3.currentProvider.send.yields("error1", "fakeResult1");
            web3.evm.mine()
                .then(() => done("Should not have reached here"))
                .catch(error => {
                    done(error == "error1" ? undefined : "Did not pass error");
                });
        });

        it("should process return if ok", function(done) {
            web3.currentProvider.send.yields(null, { result: "fakeResult1" });
            web3.evm.mine()
                .then(result => done(result == "fakeResult1" ? undefined : "Did not pass result"))
                .catch(done);
        });
    });
});


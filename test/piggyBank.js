const PiggyBank = artifacts.require("./PiggyBank.sol");
const Promise = require("bluebird");
const expectedException = require("../utils/expectedException.js");
let addEvmFunctions;

const passes = [
    {
        title: "PiggyBank 1",
        getAddEvmFunctions: () => require("../utils/evmFunctions.js")
    },
    {
        title: "PiggyBank 2",
        getAddEvmFunctions: () => require("../utils/evmFunctions2.js")
    }
];

passes.forEach(function(pass) {

    contract(pass.title, function(accounts) {

        let isTestRPC;

        before("should adapt per pass", function() {
            addEvmFunctions = pass.getAddEvmFunctions();
            addEvmFunctions(web3);
            Promise.promisifyAll(web3.eth, { suffix: "Promise" });
            Promise.promisifyAll(web3.version, { suffix: "Promise" });
            Promise.promisifyAll(web3.evm, { suffix: "Promise" });
        });

        before("should identify TestRPC", function() {
            return web3.version.getNodePromise()
                .then(node => isTestRPC = node.indexOf("EthereumJS TestRPC") >= 0);
        });

        describe("constructor", function() {
            it("should be possible to deploy PiggyBank", function() {
                return PiggyBank.new({ from: accounts[ 0 ] })
                    .then(instance => instance.heldCount())
                    .then(heldCount => assert.strictEqual(heldCount.toNumber(), 0));
            });

            it("should not be possible to deploy PiggyBank with value", function() {
                return PiggyBank.new({ from: accounts[ 0 ], value: 1, gas: 3000000 })
                    .then(
                    () => { throw new Error("should have thrown"); },
                    e => assert.strictEqual(e.message, "Cannot send value to non-payable constructor"));
            });
        });

        describe("hold 1", function() {
            let instance;

            beforeEach("should deploy a new instance", function() {
                return PiggyBank.new({ from: accounts[ 0 ] })
                    .then(created => instance = created);
            });

            it("should be possible to hold value", function() {
                return instance.hold(500, { from: accounts[ 0 ], value: 1000 })
                    .then(txObject => {
                        assert.strictEqual(txObject.logs.length, 1);
                        assert.strictEqual(txObject.logs[ 0 ].event, "LogHeld");
                        const eventArgs = txObject.logs[ 0 ].args;
                        assert.strictEqual(eventArgs.id.toNumber(), 0);
                        assert.strictEqual(eventArgs.forWhom, accounts[ 0 ]);
                        assert.strictEqual(eventArgs.amount.toNumber(), 1000);
                        assert.strictEqual(eventArgs.releaseOn.toNumber(), 500);
                        return instance.heldCount();
                    })
                    .then(heldCount => {
                        assert.strictEqual(heldCount.toNumber(), 1);
                        return instance.holdings(0);
                    })
                    .then(holding => {
                        assert.strictEqual(holding[ 0 ], accounts[ 0 ]);
                        assert.strictEqual(holding[ 1 ].toNumber(), 1000);
                        assert.strictEqual(holding[ 2 ].toNumber(), 500);
                        return web3.eth.getBalancePromise(instance.address);
                    })
                    .then(balance => assert.strictEqual(balance.toNumber(), 1000));
            });

            it("should be possible to use snapshot and revert 2 blocks to undo hold", function() {
                if (!isTestRPC) this.skip("Needs TestRPC");
                let snapshotId, blockNumber;
                return web3.evm.snapshotPromise()
                    .then(_snapshotId => {
                        snapshotId = _snapshotId;
                        return web3.eth.getBlockNumberPromise();
                    })
                    .then(_blockNumber => {
                        blockNumber = _blockNumber;
                        return instance.hold(500, { from: accounts[ 0 ], value: 1000 });
                    })
                    .then(txObject => {
                        return web3.eth.getBlockNumberPromise();
                    })
                    .then(_blockNumber => {
                        assert.strictEqual(_blockNumber, blockNumber + 1);
                        return web3.evm.minePromise();
                    })
                    .then(() => {
                        return web3.eth.getBlockNumberPromise();
                    })
                    .then(_blockNumber => {
                        assert.strictEqual(_blockNumber, blockNumber + 2);
                        return web3.evm.revertPromise(snapshotId);
                    })
                    .then(result => {
                        assert.isTrue(result);
                        return instance.heldCount();
                    })
                    .then(heldCount => {
                        assert.strictEqual(heldCount.toNumber(), 0);
                        return web3.eth.getBlockNumberPromise();
                    })
                    .then(_blockNumber => assert.strictEqual(_blockNumber, blockNumber));
            });
        });

        describe("hold 2 by same", function() {
            let instance;

            beforeEach("should deploy a new instance with 1 holding", function() {
                return PiggyBank.new({ from: accounts[ 0 ] })
                    .then(created => {
                        instance = created;
                        return instance.hold(500, { from: accounts[ 0 ], value: 1000 });
                    });
            });

            it("should be possible to hold value again", function() {
                return instance.hold(1500, { from: accounts[ 0 ], value: 700 })
                    .then(txObject => {
                        assert.strictEqual(txObject.logs.length, 1);
                        assert.strictEqual(txObject.logs[ 0 ].event, "LogHeld");
                        const eventArgs = txObject.logs[ 0 ].args;
                        assert.strictEqual(eventArgs.id.toNumber(), 1);
                        assert.strictEqual(eventArgs.forWhom, accounts[ 0 ]);
                        assert.strictEqual(eventArgs.amount.toNumber(), 700);
                        assert.strictEqual(eventArgs.releaseOn.toNumber(), 1500);
                        return instance.heldCount();
                    })
                    .then(heldCount => {
                        assert.strictEqual(heldCount.toNumber(), 2);
                        return instance.holdings(1);
                    })
                    .then(holding => {
                        assert.strictEqual(holding[ 0 ], accounts[ 0 ]);
                        assert.strictEqual(holding[ 1 ].toNumber(), 700);
                        assert.strictEqual(holding[ 2 ].toNumber(), 1500);
                        return web3.eth.getBalancePromise(instance.address);
                    })
                    .then(balance => assert.strictEqual(balance.toNumber(), 1700));
            });
        });

        describe("hold 2 by different", function() {
            let instance;

            beforeEach("should deploy a new instance with 1 holding", function() {
                return PiggyBank.new({ from: accounts[ 0 ] })
                    .then(created => {
                        instance = created;
                        return instance.hold(500, { from: accounts[ 0 ], value: 1000 });
                    });
            });

            it("should be possible to hold value by other account", function() {
                return instance.hold(1500, { from: accounts[ 1 ], value: 700 })
                    .then(txObject => {
                        assert.strictEqual(txObject.logs.length, 1);
                        assert.strictEqual(txObject.logs[ 0 ].event, "LogHeld");
                        const eventArgs = txObject.logs[ 0 ].args;
                        assert.strictEqual(eventArgs.id.toNumber(), 1);
                        assert.strictEqual(eventArgs.forWhom, accounts[ 1 ]);
                        assert.strictEqual(eventArgs.amount.toNumber(), 700);
                        assert.strictEqual(eventArgs.releaseOn.toNumber(), 1500);
                        return instance.heldCount();
                    })
                    .then(heldCount => {
                        assert.strictEqual(heldCount.toNumber(), 2);
                        return instance.holdings(1);
                    })
                    .then(holding => {
                        assert.strictEqual(holding[ 0 ], accounts[ 1 ]);
                        assert.strictEqual(holding[ 1 ].toNumber(), 700);
                        assert.strictEqual(holding[ 2 ].toNumber(), 1500);
                        return web3.eth.getBalancePromise(instance.address);
                    })
                    .then(balance => assert.strictEqual(balance.toNumber(), 1700));
            });
        });

        describe("release", function() {
            let instance, deployStamp;

            beforeEach("should deploy a new instance and keep timestamp", function() {
                return PiggyBank.new({ from: accounts[ 0 ] })
                    .then(created => {
                        instance = created;
                        return web3.eth.getTransactionReceiptPromise(created.transactionHash);
                    })
                    .then(receipt => web3.eth.getBlockPromise(receipt.blockNumber))
                    .then(block => deployStamp = block.timestamp);
            });

            it("should not do anything if not a holding", function() {
                return instance.release(0, { from: accounts[ 0 ], gas: 3000000 });
            });

            describe("just in time", function() {
                beforeEach("should add a holding releasable now", function() {
                    return instance.hold(deployStamp, { from: accounts[ 0 ], value: 1000 });
                });

                it("should release right away", function() {
                    let balance0Before;
                    return web3.eth.getBalancePromise(accounts[ 0 ])
                        .then(balance => {
                            balance0Before = balance;
                            return instance.release(0, { from: accounts[ 0 ] });
                        })
                        .then(txObject => {
                            assert.strictEqual(txObject.logs.length, 1);
                            assert.strictEqual(txObject.logs[ 0 ].event, "LogReleased");
                            const eventArgs = txObject.logs[ 0 ].args;
                            assert.strictEqual(eventArgs.id.toNumber(), 0);
                            assert.strictEqual(eventArgs.forWhom, accounts[ 0 ]);
                            assert.strictEqual(eventArgs.amount.toNumber(), 1000);
                            return Promise.all([
                                txObject.receipt,
                                web3.eth.getTransactionPromise(txObject.tx),
                                web3.eth.getBalancePromise(accounts[ 0 ])
                            ]);
                        })
                        .then(values => {
                            const balance0After = balance0Before
                                .minus(values[ 0 ].gasUsed * values[ 1 ].gasPrice)
                                .plus(1000);
                            assert.strictEqual(values[ 2 ].toString(10), balance0After.toString(10));
                            return web3.eth.getBalancePromise(instance.address);
                        })
                        .then(balance => assert.strictEqual(balance.toNumber(), 0));
                });

                it("should release right away, even with another account", function() {
                    let balance0Before;
                    return web3.eth.getBalancePromise(accounts[ 0 ])
                        .then(balance => {
                            balance0Before = balance;
                            return instance.release(0, { from: accounts[ 1 ] });
                        })
                        .then(txObject => {
                            assert.strictEqual(txObject.logs.length, 1);
                            assert.strictEqual(txObject.logs[ 0 ].event, "LogReleased");
                            const eventArgs = txObject.logs[ 0 ].args;
                            assert.strictEqual(eventArgs.id.toNumber(), 0);
                            assert.strictEqual(eventArgs.forWhom, accounts[ 0 ]);
                            assert.strictEqual(eventArgs.amount.toNumber(), 1000);
                            return Promise.all([
                                txObject.receipt,
                                web3.eth.getTransactionPromise(txObject.tx),
                                web3.eth.getBalancePromise(accounts[ 0 ])
                            ]);
                        })
                        .then(values => {
                            const balance0After = balance0Before
                                .plus(1000);
                            assert.strictEqual(values[ 2 ].toString(10), balance0After.toString(10));
                            return web3.eth.getBalancePromise(instance.address);
                        })
                        .then(balance => assert.strictEqual(balance.toNumber(), 0));
                });
            });

            describe("later", function() {
                beforeEach("should add a holding releasable in 1 hour", function() {
                    return instance.hold(deployStamp + 3600, { from: accounts[ 0 ], value: 1000 });
                });

                it("should fail to release if early", function() {
                    return expectedException(
                        () => instance.release(0, { from: accounts[ 0 ], gas: 3000000 }),
                        3000000);
                });

                it("should advance and release", function() {
                    if (!isTestRPC) this.skip("Needs TestRPC");
                    let increaseBefore;
                    return web3.evm.increaseTimePromise(0)
                        .then(_increaseBefore => {
                            increaseBefore = _increaseBefore;
                            return web3.evm.increaseTimePromise(3600);
                        })
                        .then(increase => {
                            assert.strictEqual(increase, increaseBefore + 3600);
                            return instance.release(0, { from: accounts[ 0 ] });
                        })
                        .then(txObject => {
                            assert.strictEqual(txObject.logs.length, 1);
                            assert.strictEqual(txObject.logs[ 0 ].event, "LogReleased");
                            const eventArgs = txObject.logs[ 0 ].args;
                            assert.strictEqual(eventArgs.id.toNumber(), 0);
                            assert.strictEqual(eventArgs.forWhom, accounts[ 0 ]);
                            assert.strictEqual(eventArgs.amount.toNumber(), 1000);
                            return web3.eth.getBalancePromise(instance.address);
                        })
                        .then(balance => assert.strictEqual(balance.toNumber(), 0));
                });
            });
        });
    });

});
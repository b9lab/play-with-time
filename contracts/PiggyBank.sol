pragma solidity ^0.4.4;

contract PiggyBank {
    struct Held {
        address forWhom;
        uint amount;
        uint releaseOn;
    }
    mapping (uint => Held) public holdings;
    uint public heldCount;

    event LogHeld(uint indexed id, address indexed forWhom, uint amount, uint releaseOn);
    event LogReleased(uint indexed id, address indexed forWhom, uint amount);

    function hold(uint releaseOn) payable {
        holdings[heldCount] = Held({
            forWhom: msg.sender,
            amount: msg.value,
            releaseOn: releaseOn
        });
        LogHeld(heldCount++, msg.sender, msg.value, releaseOn);
    }

    function release(uint id) {
        Held held = holdings[id];
        if (now < held.releaseOn) throw;
        uint amount = held.amount;
        LogReleased(id, held.forWhom, amount);
        held.amount = 0;
        if (!held.forWhom.send(amount)) {
            throw;
        }
    }
}

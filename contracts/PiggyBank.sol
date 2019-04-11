pragma solidity 0.5.0;

contract PiggyBank {
    struct Held {
        address payable forWhom;
        uint amount;
        uint releaseOn;
    }
    mapping (uint => Held) public holdings;
    uint public heldCount;

    event LogHeld(uint indexed id, address indexed forWhom, uint amount, uint releaseOn);
    event LogReleased(uint indexed id, address indexed forWhom, uint amount);

    function hold(uint releaseOn) public payable {
        holdings[heldCount] = Held({
            forWhom: msg.sender,
            amount: msg.value,
            releaseOn: releaseOn
        });
        emit LogHeld(heldCount++, msg.sender, msg.value, releaseOn);
    }

    function release(uint id) public {
        Held storage held = holdings[id];
        require(held.releaseOn <= now);
        uint amount = held.amount;
        emit LogReleased(id, held.forWhom, amount);
        held.amount = 0;
        held.forWhom.transfer(amount);
    }
}

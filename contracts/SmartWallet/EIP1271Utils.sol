// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Strings.sol";

contract EIP1271Utils {
    // returns the last 4 digits of the contract address in decimal form, and adds 1000 if below 1000
    function getLast4Digits() public view returns (uint16) {
        uint256 decimalAddress = uint256(uint160(address(this)));
        uint16 last4Digits = uint16(decimalAddress % 10000);
        if (last4Digits < 1000) return last4Digits + 1000;
        return last4Digits;
    }

    // for 14 character strings
    function getEthSignedMessageHash(
        string memory _message
    ) public pure returns (bytes32) {
        /*
        Signature is produced by signing a keccak256 hash with the following format:
        "\x19Ethereum Signed Message\n" + len(msg) + msg
        */
        return
            keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n14", _message)
            );
    }

    function get4DigitsMessageHash() public view returns (bytes32) {
        return
            getEthSignedMessageHash(
                string.concat(
                    "MtPelerin-",
                    Strings.toString(uint256(getLast4Digits()))
                )
            );
    }
}

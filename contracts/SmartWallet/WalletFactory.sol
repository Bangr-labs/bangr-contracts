// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.13;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {CREATE3} from "solmate/src/utils/CREATE3.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {ERC1967CustomProxy} from "./ERC1967CustomProxy.sol";
import {WalletLogic} from "./WalletLogic.sol";

contract WalletFactory is Ownable {
    bytes bytecode = type(ERC1967CustomProxy).creationCode;

    address public logic;

    constructor(address _logic) {
        logic = _logic;
    }

    function setSCWLogic(address _logic) public onlyOwner {
        logic = _logic;
    }

    function deploy(address _owner) public returns (address payable wallet) {
        wallet = payable(getWalletAddress(_owner));

        if (!Address.isContract(wallet)) {
            bytes memory creationCode = abi.encodePacked(
                bytecode,
                abi.encode(logic, abi.encodeCall(WalletLogic.initialize, ()))
            );
            wallet = payable(CREATE3.deploy(_salt(_owner), creationCode, 0));

            WalletLogic(wallet).initialize();
            WalletLogic(wallet).transferOwnership(_owner);
        }
        return wallet;
    }

    function getWalletAddress(address _owner) public view returns (address) {
        return CREATE3.getDeployed(_salt(_owner));
    }

    function _salt(address _sender) internal pure returns (bytes32) {
        return bytes32(abi.encodePacked(_sender));
    }
}

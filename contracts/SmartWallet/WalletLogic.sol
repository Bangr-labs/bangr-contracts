// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.13;

import {UUPSUpgradeable} from "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {BangrCallHelpers} from "./BangrCallHelpers.sol";
import {EIP1271Utils} from "./EIP1271Utils.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract WalletLogic is
    UUPSUpgradeable,
    OwnableUpgradeable,
    BangrCallHelpers,
    EIP1271Utils
{
    uint256 public nonce;

    bytes4 internal constant MAGICVALUE = 0x1626ba7e;

    mapping(bytes32 => bool) public signedMessages;

    modifier onlyOwnerOrSelf() {
        require(
            msg.sender == owner() || msg.sender == address(this),
            "only owner or self"
        );
        _;
    }

    function initialize() public initializer {
        __Ownable_init();
        signedMessages[
            0xb77c35c892a1b24b10a2ce49b424e578472333ee8d2456234fff90626332c50f
        ] = true; // signing for Monerium
        signedMessages[get4DigitsMessageHash()] = true; // signing for MtPelerin
    }

    function _authorizeUpgrade(address) internal override onlyOwnerOrSelf {}

    function callWithSignature(
        Call[] memory calls,
        bytes memory signature
    ) public payable {
        bytes32 structHash = keccak256(
            abi.encode(_CALLS_ARRAY_TYPEHASH, GET_CALLS_ARRAY_PACKETHASH(calls))
        );
        require(
            _validateSignature(structHash, signature, owner()),
            "invalid signature"
        );

        for (uint256 i = 0; i < calls.length; i += 1) {
            if (calls[i].cid != getChainID()) {
                continue;
            }
            if (calls[i].nonce == nonce) {
                nonce++;
                (bool success, bytes memory returnData) = calls[i].to.call{
                    value: calls[i].value,
                    gas: calls[i].gas
                }(calls[i].callData);

                if (!success) {
                    assembly {
                        revert(add(returnData, 32), mload(returnData))
                    }
                }
            } else {
                revert("invalid nonce");
            }
        }
    }

    receive() external payable {}

    function addSignature(bytes32 _messageHash) external onlyOwner {
        signedMessages[_messageHash] = true;
    }

    function isValidSignature(
        bytes32 _hash,
        bytes calldata _signature
    ) external view returns (bytes4) {
        if (_signature.length == 0) {
            if (signedMessages[_hash] == true) {
                return 0x1626ba7e;
            } else {
                return 0xffffffff;
            }
        } else {
            address signer = ECDSA.recover(_hash, _signature);
            if (signer == owner()) {
                return 0x1626ba7e;
            } else {
                return 0xffffffff;
            }
        }
    }
}

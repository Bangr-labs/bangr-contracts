// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract BangrCallHelpers {
    bytes32 public constant _CALLS_ARRAY_TYPEHASH =
        keccak256(
            "Calls(Call[] Calls)Call(address to,uint32 cid,uint256 deadline,uint256 value,uint256 gas,bytes callData,uint256 nonce)"
        );
    bytes32 public constant _CALL_TYPEHASH =
        keccak256(
            "Call(address to,uint32 cid,uint256 deadline,uint256 value,uint256 gas,bytes callData,uint256 nonce)"
        );

    struct Call {
        address to;
        uint32 cid;
        uint256 deadline;
        uint256 value;
        uint256 gas;
        bytes callData;
        uint256 nonce;
    }

    struct ConvertedCall {
        address to;
        uint32 cid;
        uint256 deadline;
        uint256 value;
        uint256 gas;
        bytes32 callData;
        uint256 nonce;
    }

    function _validateSignature(
        bytes32 structHash,
        bytes memory signature,
        address _signer
    ) internal view returns (bool) {
        bytes32 hash = _hashTypedDataV4(structHash);
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(signature);
        address signer = ECDSA.recover(hash, v, r, s);
        require(signer == _signer, "CallWithSignature: invalid signature");
        return true;
    }

    function splitSignature(
        bytes memory sig
    ) public pure returns (uint8 v, bytes32 r, bytes32 s) {
        require(sig.length == 65);

        assembly {
            // first 32 bytes, after the length prefix.
            r := mload(add(sig, 32))
            // second 32 bytes.
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes).
            v := byte(0, mload(add(sig, 96)))
        }

        return (v, r, s);
    }

    function getChainID() internal view returns (uint256) {
        uint256 id;
        assembly {
            id := chainid()
        }
        return id;
    }

    function _hashTypedDataV4(
        bytes32 structHash
    ) internal view virtual returns (bytes32) {
        return ECDSA.toTypedDataHash(_buildDomainSeparator(), structHash);
    }

    function _buildDomainSeparator() private pure returns (bytes32) {
        bytes32 typeHash = keccak256(
            "EIP712Domain(string name,string version,uint256 chainId)"
        );
        bytes32 hashedName = keccak256(bytes("Poche"));
        bytes32 hashedVersion = keccak256(bytes("1"));
        return keccak256(abi.encode(typeHash, hashedName, hashedVersion, 1));
    }

    function GET_CALL_PACKETHASH(
        Call memory _input
    ) public pure returns (bytes32) {
        bytes memory encoded = abi.encode(
            _CALL_TYPEHASH,
            _input.to,
            _input.cid,
            _input.deadline,
            _input.value,
            _input.gas,
            keccak256(_input.callData),
            _input.nonce
        );

        return keccak256(encoded);
    }

    function GET_CALLS_ARRAY_PACKETHASH(
        Call[] memory _input
    ) public pure returns (bytes32) {
        bytes memory encoded;
        for (uint i = 0; i < _input.length; i++) {
            encoded = bytes.concat(encoded, GET_CALL_PACKETHASH(_input[i]));
        }

        bytes32 hash = keccak256(encoded);
        return hash;
    }
}

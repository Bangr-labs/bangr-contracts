const hre = require("hardhat");
const fs = require("fs");

const signTypedDataTypes = {
  Calls: [{ name: "Calls", type: "Call[]" }],
  Call: [
    { name: "to", type: "address" },
    { name: "cid", type: "uint32" },
    { name: "deadline", type: "uint256" },
    { name: "value", type: "uint256" },
    { name: "gas", type: "uint256" },
    { name: "callData", type: "bytes" },
    { name: "nonce", type: "uint256" },
  ],
};

const signTypedDataDomain = {
  name: "Poche",
  version: "1",
  chainId: "1",
};

// this script is used to switch the implementation of a proxy contract by relaying a transaction
// lets update to the new (identical) logic : 0x6673b5BCDaCfB7411d5B0bF10e6773d101Aa3b9C
async function main() {
    const me = (await hre.ethers.getSigners())[0]
    console.log('me', me.address)
    const myProxyAddress = "0x5522BA0a1aCCfD5347f871B7fef71246Bd720648"
    const proxy = await hre.ethers.getContractAt("WalletLogic", myProxyAddress);

    const calls = [
      {
        to: proxy.address,
        cid: 137,
        deadline: Math.floor(Date.now() / 1000) + 3600, // now + 1 hour
        value: hre.ethers.BigNumber.from(0),
        gas: 2000000,
        callData: proxy.interface.encodeFunctionData("upgradeTo", ["0x6673b5BCDaCfB7411d5B0bF10e6773d101Aa3b9C"]),
        nonce: await proxy.nonce(),
      },
    ]
    
    const callsObject = {
      Calls: calls,
    };

    console.log('callsObject', callsObject)

    const signature = await me._signTypedData(
      signTypedDataDomain,
      signTypedDataTypes,
      callsObject
    );

    console.log('signature', signature)

    const upgradeTx = await proxy.callWithSignature(calls, signature, {
      value: hre.ethers.BigNumber.from(0),
      gasLimit: 2000000,
    });

    console.log('upgradeTx', upgradeTx.hash)
    
    await upgradeTx.wait()
    console.log('upgradeTx done')

    const _IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
    const implementation = await ethers.provider.getStorageAt(proxy.address, _IMPLEMENTATION_SLOT)

    console.log('new implementation of my wallet:', implementation)
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
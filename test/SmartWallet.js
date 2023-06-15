const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

const types = {
  Calls : [
    { name: 'Calls', type: 'Call[]' },
  ],
  Call : [
    { name: 'to', type: 'address' },
    { name: 'cid', type: 'uint32' },
    { name: 'deadline', type: 'uint256' },
    { name: 'value', type: 'uint256' },
    { name: 'gas', type: 'uint256' },
    { name: 'callData', type: 'bytes' },
    { name: 'nonce', type: 'uint256' },
  ]
}

const domain = {
  name: "Poche",
  version: "1",
  chainId: "1",
}

describe("Deploy SmartWallet", function () {
  async function deploySmartWalletFixture() {
    const [deployer, user, someoneElse] = await ethers.getSigners();

    const WalletLogic = await hre.ethers.getContractFactory("WalletLogic");
    const WalletFactory = await hre.ethers.getContractFactory("WalletFactory");
    const BoomToken = await hre.ethers.getContractFactory("Token");

    const walletLogic = await WalletLogic.deploy();
    const walletFactory = await WalletFactory.deploy(walletLogic.address);
    const boomToken = await BoomToken.deploy("Boomerang", "BOOM");

    await walletFactory.deploy(user.address, {gasLimit: 2000000});
    const proxyAddress = await walletFactory.getWalletAddress(user.address)
    
    const proxy = await hre.ethers.getContractAt("WalletLogic", proxyAddress);

    console.log("Logic: " + walletLogic.address);
    console.log("Factory: " + walletFactory.address);
    console.log("boomToken: " + boomToken.address);
    console.log("proxy: " + proxy.address);

    const calls = [
      {
        to: boomToken.address,
        cid: 31337,
        deadline: Math.floor(Date.now() / 1000) + 3600,
        value: "0",
        gas: "2000000",
        callData: boomToken.interface.encodeFunctionData("mint", [proxy.address, "1000000000"]),
        nonce: 0,
      },
      {
        to: boomToken.address,
        cid: 31337,
        deadline: Math.floor(Date.now() / 1000) + 3600,
        value: "0",
        gas: "2000000",
        callData: boomToken.interface.encodeFunctionData("transfer", [someoneElse.address, "1000000000"]),
        nonce: 1,
      }
    ]

    return { walletLogic, walletFactory, proxyAddress, proxy, deployer, user, someoneElse, boomToken, calls };
  }

  describe("Deployment", function () {
    it("Should set the right owner of WalletFactory", async function () {
      const { walletFactory, deployer } = await loadFixture(deploySmartWalletFixture);

      expect(await walletFactory.owner()).to.equal(deployer.address);
    });

    it("Should set the right logic in WalletFactory", async function () {
      const { walletLogic, walletFactory } = await loadFixture(deploySmartWalletFixture);

      expect(await walletFactory.logic()).to.equal(walletLogic.address);
    });

    it("Should deploy the user's smart wallet at the expected address", async function () {
      const { proxyAddress } = await loadFixture(deploySmartWalletFixture);
      
      const proxyByteCode = await ethers.provider.getCode(proxyAddress)

      expect(proxyByteCode).to.not.equal("0x");
    });

    it("Should have the correct implementation", async function () {
      const { walletLogic, proxyAddress } = await loadFixture(deploySmartWalletFixture);

      const _IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
      const implementation = await ethers.provider.getStorageAt(proxyAddress, _IMPLEMENTATION_SLOT)

      expect(`0x${implementation.slice(26)}`).to.equal(walletLogic.address.toLowerCase());
    });

    it("Should be initialized", async function () {
      const { proxyAddress } = await loadFixture(deploySmartWalletFixture);

      const initialized = await ethers.provider.getStorageAt(proxyAddress, 0)

      expect(Number(initialized)).to.equal(1);
    });

    it("Should transfer ownership of the proxy to the user", async function () {
      const { proxy, user } = await loadFixture(deploySmartWalletFixture);

      expect(await proxy.owner()).to.equal(user.address);
    });
  });

  describe("Upgrade Logic", function () {
    it("Should allow the user to update the logic", async function () {
      const { proxy, user } = await loadFixture(deploySmartWalletFixture);

      const WalletLogic = await hre.ethers.getContractFactory("WalletLogic");
      const newWalletLogic = await WalletLogic.deploy();

      await proxy.connect(user).upgradeTo(newWalletLogic.address)

      const _IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
      const implementation = await ethers.provider.getStorageAt(proxy.address, _IMPLEMENTATION_SLOT)

      expect(`0x${implementation.slice(26)}`).to.equal(newWalletLogic.address.toLowerCase());
    });

    it("Should not allow the user to update the to a non-contract address", async function () {
      const { proxy, user } = await loadFixture(deploySmartWalletFixture);

      const randomEoaAddress = "0xE6E4b6a802F2e0aeE5676f6010e0AF5C9CDd0a50"

      await expect(
        proxy.connect(user).upgradeTo(randomEoaAddress)
      ).to.be.reverted;
    });

    it("Should not allow someone else nor the deployer to update the logic", async function () {
      const { proxy, deployer, someoneElse } = await loadFixture(deploySmartWalletFixture);

      const WalletLogic = await hre.ethers.getContractFactory("WalletLogic");
      const newWalletLogic = await WalletLogic.deploy();

      await expect(proxy.connect(someoneElse).upgradeTo(newWalletLogic.address)).to.be.revertedWith("only owner or self");
      
      await expect(proxy.connect(deployer).upgradeTo(newWalletLogic.address)).to.be.revertedWith("only owner or self");
    });
  })

  describe("Calls", function () {
    it("Should allow anyone to send arrays of calls signed by the user", async function () {
      const { proxy, user, someoneElse, boomToken, calls } = await loadFixture(deploySmartWalletFixture);

      const value = {
        Calls : calls
      }

      const signature = await user._signTypedData(domain, types, value);

      await expect(proxy.callWithSignature(calls, signature)).to.changeTokenBalances(
        boomToken,
        [proxy, someoneElse],
        ["0", "1000000000"]
      );
    });

    it("Should not allow arrays of calls signed by the another user", async function () {
      const { proxy, someoneElse, calls } = await loadFixture(deploySmartWalletFixture);

      const value = {
        Calls : calls
      }

      const signature = await someoneElse._signTypedData(domain, types, value);

      await expect(
        proxy.callWithSignature(calls, signature)
      ).to.be.revertedWith("CallWithSignature: invalid signature");
    });

    it("Should revert with right returnData if a call is invalid", async function () {
      const { proxy, user, someoneElse, boomToken, calls } = await loadFixture(deploySmartWalletFixture);

      // amount too big
      const corruptedCalls = [calls[0], {
        ...calls[1],
        callData: boomToken.interface.encodeFunctionData("transfer", [someoneElse.address, "100000000000"])
      }]

      const value = {
        Calls : corruptedCalls
      }

      const signature = await user._signTypedData(domain, types, value);

      await expect(proxy.callWithSignature(corruptedCalls, signature)).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("Should revert if a nonce is invalid", async function () {
      const { proxy, user, calls } = await loadFixture(deploySmartWalletFixture);

      // amount too big
      const corruptedCalls = [calls[0], {
        ...calls[1],
        nonce: 2
      }]

      const value = {
        Calls : corruptedCalls
      }

      const signature = await user._signTypedData(domain, types, value);

      await expect(proxy.callWithSignature(corruptedCalls, signature)).to.be.revertedWith("invalid nonce");
    });
  })

  describe("EIP1271", function () {
    it("Should be signed for MtPelerin", async function () {
      const { proxy } = await loadFixture(deploySmartWalletFixture);

      const signedMessageHashFromSol = await proxy.get4DigitsMessageHash()

      // console.log('lastDigits: ', await proxy.getLast4Digits())
      // console.log('messageHash from ethers', ethers.utils.hashMessage("MtPelerin-9977"))
      // console.log('signedMessageHashFromSol', signedMessageHashFromSol)

      expect(await proxy.isValidSignature(signedMessageHashFromSol, "0x")).to.equal("0x1626ba7e");
    });

    it("Should be signed for Monerium", async function () {
      const { proxy } = await loadFixture(deploySmartWalletFixture);

      expect(await proxy.isValidSignature("0xb77c35c892a1b24b10a2ce49b424e578472333ee8d2456234fff90626332c50f", "0x")).to.equal("0x1626ba7e");
    });

    it("Should be able to sign in the classical, non Gnosis-Safe manner", async function () {
      const { proxy } = await loadFixture(deploySmartWalletFixture);
      // TODO

    });

  })
});

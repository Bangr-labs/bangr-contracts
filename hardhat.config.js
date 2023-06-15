require("@nomicfoundation/hardhat-toolbox");
require('hardhat-storage-layout');
require('hardhat-abi-exporter');
require('dotenv').config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  settings: {
    optimizer: {
      enabled: true,
      runs: 1000,
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: process.env.HARDHAT_CHAIN_ID ? Number(process.env.HARDHAT_CHAIN_ID) : 31337
    },
    "56": {
      url: "https://bsc-dataseed.binance.org/",
      accounts: [process.env.PKEY]
    },
    "10": {
      url: "https://mainnet.optimism.io",
      accounts: [process.env.PKEY]
    },
    "137": {
      url: "https://polygon.llamarpc.com",
      accounts: [process.env.PKEY]
    },
    "42161": {
      url: "https://arb1.arbitrum.io/rpc",
      accounts: [process.env.PKEY]
    },
    localFork: {
      url: "http://127.0.0.1:8545/",
      accounts: ["ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"]
    },
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      accounts: ["2ccfe123b7e5a3f6672cc6956f3c25b7fa25df1365cf0879a207756a68ac3f8b"]
    },
    gnosis: {
      url: "https://rpc.gnosis.gateway.fm",
      accounts: ["2ccfe123b7e5a3f6672cc6956f3c25b7fa25df1365cf0879a207756a68ac3f8b"]
    },
    mumbai: {
      url: "https://polygon-testnet.public.blastapi.io",
      accounts: ["2ccfe123b7e5a3f6672cc6956f3c25b7fa25df1365cf0879a207756a68ac3f8b"]
    },
    goerli: {
      url: "https://eth-goerli.public.blastapi.io",
      accounts: [process.env.GOERLIPKEY]
    },
    optiTest: {
      url: "https://goerli.optimism.io",
      accounts: ["2ccfe123b7e5a3f6672cc6956f3c25b7fa25df1365cf0879a207756a68ac3f8b"]
    },
    arbiTest: {
      url: "https://arb-goerli.g.alchemy.com/v2/demo",
      accounts: ["2ccfe123b7e5a3f6672cc6956f3c25b7fa25df1365cf0879a207756a68ac3f8b"]
    },
    "10000": {
      url: "http://127.0.0.1:10000",
      chainId: 10,
      accounts: ["ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"]
    },
    localNode: {
      url: "http://127.0.0.1:10000",
      accounts: ["ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"]
    },
    "10001": {
      url: "http://127.0.0.1:10001",
      chainId: 56,
      accounts: ["ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"]
    },
    "10002": {
      url: "http://127.0.0.1:10002",
      chainId: 137,
      accounts: ["ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"]
    },
    "10003": {
      url: "http://127.0.0.1:10003",
      chainId: 42161,
      accounts: ["ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"]
    },
  },
  abiExporter: {
    path: '../front/src/config/abi',
    runOnCompile: true,
    // clear: true,
    flat: true,
    spacing: 2,
    pretty: true,
    except: ["UUPSUpgradeable"]
  }
};

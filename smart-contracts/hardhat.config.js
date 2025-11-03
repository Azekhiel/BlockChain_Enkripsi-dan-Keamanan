require("@nomiclabs/hardhat-waffle"); 

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  
  networks: {
    gethDev: {
      url: "http://localhost:8545",
      // Kita hapus 'accounts' dan 'gethDevKey'
      // Ini akan memaksa Hardhat untuk bertanya ke Geth
    }
  }
};
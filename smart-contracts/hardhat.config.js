// Ganti "@nomiclabs/hardhat-waffle" dengan ini jika Anda menggunakan toolbox
require("@nomicfoundation/hardhat-toolbox"); 

// !! GANTI INI DENGAN KUNCI PRIVAT ADMIN/LOGGER ANDA !!
// (Kunci yang sama persis dengan yang ada di main.go Anda)
const ADMIN_PRIVATE_KEY = "0xb71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24", // (Pastikan ini sesuai versi file .sol Anda)
  networks: {
    // Ini adalah jaringan Geth privat Anda
    geth_private: {
      url: "http://localhost:8545", // Alamat RPC Geth
      chainId: 1337,                 // ChainID Geth Anda (dari main.go)
      
      // INI BAGIAN PENTING:
      // Kita beri tahu Hardhat "pulpen" mana yang harus dipakai
      accounts: [ADMIN_PRIVATE_KEY]    
    }
  }
};
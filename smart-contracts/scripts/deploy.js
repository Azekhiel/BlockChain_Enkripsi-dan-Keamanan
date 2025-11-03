// Kita impor 'ethers' dari hardhat
const { ethers } = require("hardhat");

async function main() {
  console.log("Memulai proses deployment...");

  // 1. Mengambil akun deployer
  // Ini sekarang akan bertanya ke Geth dan Geth akan menjawab "0x7156..."
  const [deployer] = await ethers.getSigners();
  
  console.log(`Deploying kontrak dengan akun: ${deployer.address}`);
  console.log(`(Seharusnya 0x7156...17f7)`);
  console.log(`Saldo akun: ${(await deployer.getBalance()).toString()} Wei`);

  // 2. Mengambil 'blueprint' kontrak
  const ContractFactory = await ethers.getContractFactory("AuditableRBAC", deployer);

  // 3. Mengirim transaksi 'CREATE'
  console.log("Mengirim transaksi deployment...");
  const rbacContract = await ContractFactory.deploy();

  // 4. Menunggu kontrak selesai di-deploy
  await rbacContract.deployed();

  // 5. Selesai!
  console.log(
    `✅ Kontrak AuditableRBAC berhasil di-deploy ke alamat: ${rbacContract.address}`
  );
}

// Menjalankan skrip
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
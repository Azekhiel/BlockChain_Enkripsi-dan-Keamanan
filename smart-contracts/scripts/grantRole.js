const { ethers } = require("hardhat");

async function main() {
  // =================================================================
  // === GANTI INI DENGAN ALAMAT DOMPET METAMASK ANDA (DARI FE) ===
  // =================================================================
  // Contoh: "0xc8c7Ab102B0F33A11f464010370f1Fea63c7fe92"
  const ALAMAT_DOMPET_ANDA = "0xc8c7a6fdd8f6d17fde3a83ea80b783e20451fe92"; 
  // =================================================================

  // Alamat kontrak yang di-deploy (dari main.go)
  const KONTRAK_ADDRESS = "0x3A220f351252089D385b29beca14e27F204c296A";

  // PENTING: Di main.go Anda, FINANCE_ROLE di-set sebagai hash dari "ADMIN_ROLE"
  // Kita harus menirunya 100% sama persis di sini.
  const NAMA_ROLE = "ADMIN_ROLE"; 
  const ROLE_HASH = ethers.keccak256(ethers.toUtf8Bytes(NAMA_ROLE));

  console.log("Menghubungkan ke kontrak di:", KONTRAK_ADDRESS);

  // Dapatkan "artifact" (ABI) dari kontrak Anda
  // Ganti "AuditableRBAC" dengan nama file .sol Anda jika berbeda
  const contract = await ethers.getContractAt("AuditableRBAC", KONTRAK_ADDRESS);

  console.log(`Mencoba memberikan ROLE: ${NAMA_ROLE} (${ROLE_HASH})`);
  console.log(`KEPADA ALAMAT: ${ALAMAT_DOMPET_ANDA}`);

  if (ALAMAT_DOMPET_ANDA === "GANTI_INI_DENGAN_ALAMAT_LENGKAP_ANDA") {
    console.error("!!! GAGAL: Harap ganti nilai 'ALAMAT_DOMPET_ANDA' di dalam skrip!");
    process.exit(1);
  }

  // Panggil fungsi grantRole!
  const tx = await contract.grantRole(ROLE_HASH, ALAMAT_DOMPET_ANDA);
  
  console.log("Transaksi terkirim... Menunggu konfirmasi dari Geth...");
  await tx.wait(); // Tunggu sampai transaksi di-mining

  console.log("==============================================");
  console.log(`✅ SUKSES! Role ${NAMA_ROLE} berhasil diberikan kepada ${ALAMAT_DOMPET_ANDA}`);
  console.log("Transaksi Hash:", tx.hash);
  console.log("==============================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
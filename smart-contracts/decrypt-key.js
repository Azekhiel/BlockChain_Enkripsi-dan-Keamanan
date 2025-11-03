const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers'); // Menggunakan Ethers v5

async function main() {
  // --- KONFIGURASI ---
  // 1. Ganti dengan password Anda (dari password.txt)
  const password = "tes123"; 

  // 2. Ganti dengan nama file keystore Anda
  const keystoreFileName = "UTC--2025-11-03T15-00-51.894586000Z--71562b71999873db5b286df957af199ec94617f7";
  // --- SELESAI KONFIGURASI ---

  const keystorePath = path.join(__dirname, '..', 'chaindata', 'keystore', keystoreFileName);

  try {
    console.log(`Membaca file keystore dari: ${keystorePath}`);
    const keystoreJson = fs.readFileSync(keystorePath, 'utf8');

    console.log("Mendekripsi file dengan password...");
    const wallet = await ethers.Wallet.fromEncryptedJson(keystoreJson, password);

    console.log("\n✅ BERHASIL!");
    console.log("Alamat Anda:", wallet.address);
    console.log("🔑 PRIVATE KEY ANDA (JANGAN BAGIKAN!):");
    console.log(wallet.privateKey);

  } catch (err) {
    console.error("\nGAGAL:", err.message);
  }
}

main();
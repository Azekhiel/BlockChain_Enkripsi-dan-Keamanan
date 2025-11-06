const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers'); // Kita tetap butuh Ethers v5

async function main() {
  // 1. Ganti dengan NAMA FILE KEYSTORE Anda yang benar
  const keystoreFileName = "UTC--2025-11-05T19-54-52.512614900Z--153a5212b0ea63239021410dfa864c373a254f2c";
  
  // 2. Ganti dengan PASSWORD KOSONG (karena --dev)
  const password = ""; 
  // ---------------------------------
  
  const keystorePath = path.join(__dirname, '..', 'chaindata', 'keystore', keystoreFileName);

  try {
    console.log(`Membaca file keystore dari: ${keystorePath}`);
    const keystoreJson = fs.readFileSync(keystorePath, 'utf8');
    
    console.log("Mendekripsi file dengan password KOSONG ('')...");
    
    // Kita tetap pakai fungsi 'fromEncryptedJson', tapi dengan password kosong
    const wallet = await ethers.Wallet.fromEncryptedJson(keystoreJson, password);
    
    console.log("\n✅ BERHASIL!");
    console.log("Alamat Anda:", wallet.address, "(Cocokkan dengan 0x7156...)");
    console.log("🔑 PRIVATE KEY ANDA (JANGAN BAGIKAN!):");
    console.log(wallet.privateKey);

  } catch (err) {
    console.error("\nGAGAL:", err.message);
    console.error("Pastikan 'keystoreFileName' sudah benar dan 'password' adalah string kosong (\"\").");
  }
}

main();
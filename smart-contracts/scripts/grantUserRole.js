// scripts/grantUserRole.js
const { ethers } = require("hardhat");

// --- UBAH INI ---
const KONTRAK_ADDRESS = "0xd4766aFBe333DB354C61628f9229f63f45c12C26"; // <-- Masukkan alamat kontrak Anda
const ALAMAT_USER_FINANCE = "0xEc97a6603E01e45F37B7006A3A6023489767a686";
const ALAMAT_USER_KARYAWAN = "0x6cD04d1542Ab5d6DEdFCFc5D741DECd68d4505a8";
// -----------------

async function main() {
  console.log("Memulai skrip pemberian role (granting)...");

  if (KONTRAK_ADDRESS === "0x.....") {
    console.error("⛔️ Harap masukkan alamat kontrak Anda di dalam skrip!");
    return;
  }

  // 1. Dapatkan akun admin (Super Admin)
  const [admin] = await ethers.getSigners();
  console.log(`Menggunakan akun admin: ${admin.address}`);

  // 2. Hubungkan ke kontrak
  const ContractFactory = await ethers.getContractFactory("AuditableRBAC");
  const contract = ContractFactory.attach(KONTRAK_ADDRESS);
  console.log(`Terhubung ke kontrak di: ${contract.address}`);

  // 3. Siapkan nama role
  const FINANCE_ROLE = ethers.utils.id("FINANCE_ROLE");
  const KARYAWAN_ROLE = ethers.utils.id("KARYAWAN_ROLE");

  // 4. Memberi role
  console.log("Memberi role ke user lain...");

  try {
    let tx = await contract.grantRole(FINANCE_ROLE, ALAMAT_USER_FINANCE);
    await tx.wait();
    console.log(`✅ FINANCE_ROLE diberikan ke ${ALAMAT_USER_FINANCE}`);
  } catch (e) {
    console.error(`Gagal memberi FINANCE_ROLE: ${e.message}`);
  }

  try {
    let tx = await contract.grantRole(KARYAWAN_ROLE, ALAMAT_USER_KARYAWAN);
    await tx.wait();
    console.log(`✅ KARYAWAN_ROLE diberikan ke ${ALAMAT_USER_KARYAWAN}`);
  } catch (e) {
    console.error(`Gagal memberi KARYAWAN_ROLE: ${e.message}`);
  }
  
  console.log("🎉 Pemberian Role Selesai.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
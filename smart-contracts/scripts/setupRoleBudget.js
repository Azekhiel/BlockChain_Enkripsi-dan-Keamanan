// scripts/setupRoleBudget.js
const { ethers } = require("hardhat");

// --- UBAH INI ---
const KONTRAK_ADDRESS = "0xd4766aFBe333DB354C61628f9229f63f45c12C26"; // <-- Masukkan alamat kontrak Anda
// -----------------

async function main() {
  console.log("Memulai skrip setup Role BUDGET & POLICY...");

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
  const ADMIN_ROLE = ethers.utils.id("ADMIN_ROLE");

  // 4. Mengatur budget
  console.log("Mengatur budget untuk FINANCE_ROLE...");
  let tx = await contract.setRoleBudget(FINANCE_ROLE, 1000); // Kuota 1000
  await tx.wait();
  console.log("✅ Budget Finance (1000) diatur.");

  console.log("Mengatur budget untuk KARYAWAN_ROLE...");
  tx = await contract.setRoleBudget(KARYAWAN_ROLE, 100); // Kuota 100
  await tx.wait();
  console.log("✅ Budget Karyawan (100) diatur.");

  console.log("Mengatur budget untuk ADMIN_ROLE...");
  tx = await contract.setRoleBudget(ADMIN_ROLE, 999999); // Kuota besar untuk Admin
  await tx.wait();
  console.log("✅ Budget Admin (999999) diatur.");
  console.log("🎉 Setup Budget Selesai.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
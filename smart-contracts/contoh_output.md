D:\Kuliah\SMT 7\Enkripsi\UTS\BlockChain_Enkripsi-dan-Keamanan\smart-contracts>npx hardhat run scripts/setupRoleBudget.js --network gethDev 
Memulai skrip setup Role BUDGET & POLICY...
Menggunakan akun admin: 0x153A5212b0eA63239021410dfa864c373a254F2c
Terhubung ke kontrak di: 0xd4766aFBe333DB354C61628f9229f63f45c12C26
Mengatur budget untuk FINANCE_ROLE...
✅ Budget Finance (1000) diatur.
Mengatur budget untuk KARYAWAN_ROLE...
✅ Budget Karyawan (100) diatur.
🎉 Setup Budget Selesai.

D:\Kuliah\SMT 7\Enkripsi\UTS\BlockChain_Enkripsi-dan-Keamanan\smart-contracts>npx hardhat run scripts/granUserRole.js --network gethDev    
Error HH601: Script scripts/granUserRole.js doesn't exist.

For more info go to https://v2.hardhat.org/HH601 or run Hardhat with --show-stack-traces

D:\Kuliah\SMT 7\Enkripsi\UTS\BlockChain_Enkripsi-dan-Keamanan\smart-contracts>npx hardhat run scripts/grantUserRole.js --network gethDev 
Memulai skrip pemberian role (granting)...
Menggunakan akun admin: 0x153A5212b0eA63239021410dfa864c373a254F2c
Terhubung ke kontrak di: 0xd4766aFBe333DB354C61628f9229f63f45c12C26
Memberi role ke user lain...
✅ FINANCE_ROLE diberikan ke 0xEc97a6603E01e45F37B7006A3A6023489767a686
✅ KARYAWAN_ROLE diberikan ke 0x6cD04d1542Ab5d6DEdFCFc5D741DECd68d4505a8
🎉 Pemberian Role Selesai.

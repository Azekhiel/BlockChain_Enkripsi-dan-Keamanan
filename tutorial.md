# Tutorial Menjalankan Proyek Cerberus (Lokal)

Dokumen ini menjelaskan cara menjalankan blockchain privat (Modul 1) dan menyebarkan (deploy) smart contract (Modul 2) di lingkungan *development* lokal.

## 1. Prasyarat Perangkat Lunak

Pastikan Anda telah menginstal perangkat lunak berikut di sistem Anda:

1. **Geth (Go Ethereum):** Klien resmi Ethereum. (Tutorial ini diuji pada v1.16.5).
2. **Node.js & npm:** Dibutuhkan untuk Hardhat. (Tutorial ini diuji pada Node v22+ & npm v10+).

---

## Modul 1: Menjalankan Blockchain Privat (Geth)

Bagian ini akan mengaktifkan "Benteng" (blockchain) Anda.

### Langkah 1: Bersihkan State (Opsional tapi Direkomendasikan)

Setiap kali Anda ingin memulai dari "nol" (status bersih), hapus database blockchain yang lama.

Buka terminal di *root* folder proyek (`.../BlockChain_Enkripsi-dan-Keamanan`) dan jalankan:

```cmd
rmdir /s /q chaindata
```

### Langkah 2: Jalankan Node (Jendela 1)

Jalankan skrip `run-node.bat` untuk memulai server Geth Anda dalam mode *development*.

```cmd
.\run-node.bat
```

* **Apa yang terjadi?** Skrip ini akan membuat folder `chaindata` baru dan memulai node `--dev` yang membuat blok baru setiap 5 detik.
* **PENTING:** Biarkan terminal ini **TETAP TERBUKA**. Ini adalah Jendela 1 (Server Blockchain Anda).

### Langkah 3: Verifikasi Node (Jendela 2)

Buka terminal **KEDUA** (baru) di *root* folder proyek dan jalankan `attach.bat` untuk terhubung ke *console* Geth.

```cmd
.\attach.bat
```

Anda akan melihat *prompt* `>`. Ketik perintah berikut untuk verifikasi:

1. **Cek Status Mining:**

   ```javascript
   eth.blockNumber
   ```

   (Tunggu 10 detik dan jalankan lagi. Angkanya harus bertambah).

2. **Cek Akun Deployer:**

   ```javascript
   eth.accounts
   ```

   (Ini akan menunjukkan akun *developer* Anda, misal: `["0x7156..."]`)

3. **Cek Saldo Akun:**

   ```javascript
   eth.getBalance(eth.accounts[0])
   ```

   (Ini akan menunjukkan saldo Ether yang sangat besar).

Jika `blockNumber` bertambah dan Anda melihat akun dengan saldo, **Modul 1 Selesai**. Biarkan **KEDUA** jendela ini tetap terbuka.

### File Kunci yang Digunakan (Modul 1)

**File: `run-node.bat`**

```bat
@echo off
echo Menjalankan Node Geth (Mode DEV Sederhana)...
echo JANGAN TUTUP JENDELA INI.
echo.

geth --datadir ./chaindata ^
--dev ^
--dev.period 5 ^
--http ^
--http.addr "localhost" ^
--http.port 8545 ^
--http.api "eth,net,web3,personal"

echo Node Geth dihentikan.
pause
```

**File: `attach.bat`**

```bat
@echo off
geth attach \\\.\pipe\geth.ipc
```

---

## Modul 2: Menyebarkan Smart Contract (Hardhat)

Bagian ini akan membangun "Kantor Administrasi" (`AuditableRBAC.sol`) di atas "Benteng" Anda.

### Langkah 1: Instal Dependensi

Buka terminal **KETIGA** (baru) dan arahkan ke folder `smart-contracts`.

```cmd
cd smart-contracts
```

Jalankan `npm install` untuk mengunduh Hardhat dan semua *library* yang diperlukan (Ethers.js, Waffle, OpenZeppelin).

```cmd
npm install
```

### Langkah 2: Jalankan Skrip Deployment

Pastikan **Jendela 1 (`run-node.bat`)** masih berjalan dan membuat blok.

Di terminal `smart-contracts` Anda (Jendela 3), jalankan perintah *deployment* Hardhat:

```cmd
npx hardhat run scripts/deploy.js --network gethDev
```

### Hasil yang Diharapkan

Terminal akan menampilkan log kompilasi, diikuti dengan:

```
Memulai proses deployment...
Deploying kontrak dengan akun: 0x71562b71999873DB5b286dF957af199Ec94617F7
(Seharusnya 0x7156...17f7)
Saldo akun: 1157... Wei
Mengirim transaksi deployment...
✅ Kontrak AuditableRBAC berhasil di-deploy ke alamat: 0x3A220f351252089D385b29beca14e27F204c296A
```

**Modul 2 Selesai.**

### File Kunci yang Digunakan (Modul 2)

**File: `smart-contracts/hardhat.config.js`**
(Konfigurasi ini memberi tahu Hardhat cara terhubung ke Geth Anda).

```javascript
require("@nomiclabs/hardhat-waffle");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  
  networks: {
    gethDev: {
      url: "http://localhost:8545",
      // Tidak perlu 'accounts' karena 'run-node.bat'
      // sudah meng-unlock akun via --dev dan --http.api "personal"
    }
  }
};
```

**File: `smart-contracts/scripts/deploy.js`**
(Skrip ini mengambil akun *unlocked* dari Geth dan menggunakannya untuk membayar gas *deployment*).

```javascript
const { ethers } = require("hardhat");

async function main() {
  console.log("Memulai proses deployment...");

  // 1. Mengambil akun deployer (akun 0x7156... yang di-unlock Geth)
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

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

---

## 3. Informasi Kunci (Hasil Akhir)

Setelah Modul 1 dan 2 selesai, Anda memiliki:

* **Node Blockchain Aktif:** `http://localhost:8545`
* **Alamat Kontrak (PENTING):** `0x3A220f351252089D385b29beca14e27F204c296A`

Anda sekarang siap untuk memulai **Modul 3 (Backend Go)** menggunakan Alamat Kontrak ini.

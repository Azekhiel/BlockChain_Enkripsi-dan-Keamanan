# Tutorial Menjalankan Proyek **Cerberus** (Lokal)

> Panduan lengkap — jalankan **blockchain privat** (Modul 1) dan **deploy smart contract** (Modul 2) di lingkungan *development* lokal. Ditulis agar mudah diikuti oleh pengembang yang sudah melakukan `git clone` repositori.

---

## Daftar Isi

1. [Ringkasan & Tujuan](#ringkasan--tujuan)
2. [Prasyarat Perangkat Lunak](#prasyarat-perangkat-lunak)
3. [Struktur Folder (singkat)](#struktur-folder-singkat)
4. [Modul 1 — Menjalankan Blockchain Privat (Geth)](#modul-1--menjalankan-blockchain-privat-geth)

   * Membersihkan state
   * Menjalankan node (Jendela 1)
   * Verifikasi lewat console (Jendela 2)
   * File-file penting
5. [Modul 2 — Menyebarkan Smart Contract (Hardhat)](#modul-2--menyebarkan-smart-contract-hardhat)

   * Instal dependensi
   * Konfigurasi & menjalankan deployment
   * Hasil yang diharapkan
   * File-file penting
6. [Troubleshooting & Tips](#troubleshooting--tips)
7. [Checklist Sebelum Lanjut ke Modul 3 (Backend)](#checklist-sebelum-lanjut-ke-modul-3-backend)
8. [FAQ singkat](#faq-singkat)
9. [Lisensi & Kontak](#lisensi--kontak)

---

## Ringkasan & Tujuan

Dokumen ini memandu Anda dari nol — mulai menyiapkan node Geth dalam mode *development*, memverifikasi node, lalu menggunakan Hardhat (Ethers.js) untuk meng-compile dan deploy kontrak `AuditableRBAC.sol` ke node lokal Anda.

Target pembaca: pengembang yang familiar dengan terminal / command prompt di Windows dan sudah memiliki repository proyek yang di-`clone`.

---

## Prasyarat Perangkat Lunak

Pastikan sistem Anda memiliki:

* **Geth (Go Ethereum)** — versi yang direkomendasikan: **v1.16.5** (atau versi `--dev` kompatibel).
* **Node.js & npm** — direkomendasikan Node **v22+** dan npm **v10+**.
* **npx / Hardhat** — akan di-install melalui `npm install` di folder `smart-contracts`.
* Akses ke terminal / Command Prompt (Windows). Jika di Linux/macOS, sesuaikan perintah `rmdir`/`del`/navigasi folder.

> Catatan: dokumen ini menggunakan contoh perintah Windows (`.bat`). Untuk Linux/macOS, ganti `rmdir /s /q chaindata` dengan `rm -rf chaindata` dan panggilan ke `geth attach` dengan `geth attach ./chaindata/geth.ipc` atau sesuai path.

---

## Struktur Folder (singkat)

```
/ (root repo)
├─ chaindata/                # database geth (akan dibuat saat run-node.bat)
├─ run-node.bat              # script menjalankan Geth (Mode DEV)
├─ attach.bat                # script untuk attach ke geth console
├─ smart-contracts/          # project Hardhat
│  ├─ hardhat.config.js
│  ├─ package.json
│  └─ scripts/deploy.js
└─ README.md
```

---

# Modul 1: Menjalankan Blockchain Privat (Geth)

Modul ini menyalakan "Benteng" lokal Anda: node Geth dalam mode `--dev` (convenience chain untuk development).

### Langkah 1 — Bersihkan State (opsional tapi direkomendasikan)

Jika Anda ingin memulai dari awal (state bersih), hapus folder `chaindata` di root proyek.

**Windows (Command Prompt / PowerShell):**

```cmd
rmdir /s /q chaindata
```

**Linux / macOS:**

```bash
rm -rf chaindata
```

> Kenapa? Menghapus `chaindata` memastikan node dibuat ulang, meminimalkan konflik akun/nonce/kontrak yang tersisa dari percobaan sebelumnya.

### Langkah 2 — Jalankan Node (Jendela 1)

Buka terminal pertama (Jendela 1) di root proyek, lalu jalankan:

```cmd
.\run-node.bat
```

**Contoh isi file `run-node.bat`:**

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

**Penjelasan singkat:**

* `--dev` membuat ephemeral chain untuk development.
* `--dev.period 5` berarti blok baru setiap 5 detik.
* `--http` mengaktifkan HTTP-RPC pada `localhost:8545`.

> Penting: Biarkan jendela ini **tetap terbuka** — ini adalah server blockchain Anda.

### Langkah 3 — Verifikasi Node (Jendela 2)

Buka terminal kedua (Jendela 2), lalu jalankan:

```cmd
.\attach.bat
```

**Isi file `attach.bat`:**

```bat
@echo off
geth attach \\\.\pipe\geth.ipc
```

Di prompt `>` jalankan perintah berikut untuk verifikasi:

1. Cek nomor blok (harus bertambah setiap ~5 detik):

```javascript
eth.blockNumber
```

2. Daftar akun yang tersedia (akun dev otomatis dibuat di `--dev`):

```javascript
eth.accounts
```

3. Cek saldo akun (harus besar untuk dev):

```javascript
eth.getBalance(eth.accounts[0])
```

Jika `eth.blockNumber` meningkat dan Anda melihat akun dengan saldo, berarti node berjalan dengan baik.

### File kunci (Modul 1)

* `run-node.bat` — script menjalankan geth.
* `attach.bat` — script attach ke geth console.

---

# Modul 2: Menyebarkan Smart Contract (Hardhat)

Modul ini menggunakan Hardhat (Ethers.js) untuk mengambil akun yang sudah di-unlock oleh Geth dan mengirimkan transaksi deployment.

> Pastikan Jendela 1 (run-node.bat) masih berjalan saat melakukan langkah di Modul 2.

### Langkah 1 — Instal Dependensi

Buka terminal **ketiga** (Jendela 3) dan masuk ke folder `smart-contracts`:

```cmd
cd smart-contracts
npm install
```

Perintah ini meng-install Hardhat, Ethers.js, Waffle, OpenZeppelin, dan dependensi lain yang tertulis di `package.json`.

### Langkah 2 — Konfigurasi Hardhat

Contoh sederhana `hardhat.config.js` yang terhubung ke node lokal (`http://localhost:8545`):

```javascript
require("@nomiclabs/hardhat-waffle");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    gethDev: {
      url: "http://localhost:8545",
      // Tidak perlu 'accounts' di sini karena akun di-unlock melalui --dev
    }
  }
};
```

### Langkah 3 — Skrip Deployment

Contoh `smart-contracts/scripts/deploy.js`:

```javascript
const { ethers } = require("hardhat");

async function main() {
  console.log("Memulai proses deployment...");

  // 1. Mengambil akun deployer (akun di-unlock Geth)
  const [deployer] = await ethers.getSigners();

  console.log(`Deploying kontrak dengan akun: ${deployer.address}`);
  console.log(`Saldo akun: ${(await deployer.getBalance()).toString()} Wei`);

  // 2. Mengambil 'blueprint' kontrak
  const ContractFactory = await ethers.getContractFactory("AuditableRBAC", deployer);

  // 3. Mengirim transaksi 'CREATE'
  console.log("Mengirim transaksi deployment...");
  const rbacContract = await ContractFactory.deploy();

  // 4. Menunggu kontrak selesai di-deploy
  await rbacContract.deployed();

  // 5. Selesai!
  console.log(`✅ Kontrak AuditableRBAC berhasil di-deploy ke alamat: ${rbacContract.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### Langkah 4 — Jalankan Deployment

Dari folder `smart-contracts` di Jendela 3, jalankan:

```cmd
npx hardhat run scripts/deploy.js --network gethDev
```

**Hasil yang diharapkan:**

* Proses kompilasi Hardhat
* Log `Deploying kontrak dengan akun: 0x...`
* `✅ Kontrak AuditableRBAC berhasil di-deploy ke alamat: 0x...`

Catat alamat kontrak yang muncul — alamat ini akan dipakai di Modul 3 (Backend Go).

### File kunci (Modul 2)

* `smart-contracts/hardhat.config.js` — konfigurasi jaringan.
* `smart-contracts/scripts/deploy.js` — skrip untuk deployment.
* `smart-contracts/contracts/AuditableRBAC.sol` — kontrak yang akan di-deploy (pastikan kode kontrak ada dan kompatibel dengan Solidity 0.8.24).

---

## Troubleshooting & Tips

**1. `eth.blockNumber` tidak bertambah**

* Pastikan `run-node.bat` berjalan dan tidak ada error di jendela 1.
* Jika Geth crash, periksa output di jendela 1.

**2. Hardhat tidak menemukan signer / akun**

* Karena kita menggunakan Geth `--dev`, akun biasanya sudah di-unlock. Namun jika `ethers.getSigners()` kosong, periksa bahwa HTTP API `personal` terdaftar di `--http.api` dan bahwa Geth memang menyajikan endpoint HTTP.
* Alternatif: atur `accounts` di `hardhat.config.js` dengan private key (hanya untuk development).

**3. `connection refused` ke `http://localhost:8545`**

* Pastikan `geth` berjalan dan port 8545 tidak diblokir.

**4. Gas estimation / nonce errors saat deploy**

* Hapus `chaindata` dan ulangi untuk mendapatkan state bersih.
* Pastikan tidak ada nonce collision dengan transaksi lama.

**5. Permissions / akses `geth.ipc`**

* Jika `geth attach` gagal, jalankan `geth` dan periksa lokasi `geth.ipc` di folder `chaindata`.

---

## Checklist Sebelum Lanjut ke Modul 3 (Backend)

* [ ] Node Geth (Jendela 1) berjalan tanpa error.
* [ ] Anda bisa `attach` ke Geth dan `eth.blockNumber` bertambah.
* [ ] Hardhat ter-install (`npm install` selesai) di folder `smart-contracts`.
* [ ] Skrip `deploy.js` berhasil men-deploy kontrak dan Anda mencatat `contract address`.
* [ ] Salin alamat kontrak (`0x...`) ke konfigurasi backend (Modul 3).

---

## FAQ singkat

**Q: Apakah `--dev` cocok untuk testing produksi?**
A: Tidak. `--dev` hanya untuk development convenience. Untuk staging/production gunakan chain yang lebih permanen (private network dengan `--networkid`, static nodes, dsb.).

**Q: Bagaimana cara menggunakan akun spesifik untuk deployment?**
A: Anda bisa menambahkan private key pada `hardhat.config.js` di bagian `networks.gethDev.accounts` (hanya untuk development) atau menggunakan `personal.unlockAccount` melalui RPC jika HTTP `personal` aktif.

**Q: Kontrak tidak kompatibel saat compile di Hardhat**
A: Periksa versi `pragma solidity` pada kontrak dan sesuaikan `solidity` di `hardhat.config.js`.

---

## Lisensi & Kontak

Dokumen ini disusun untuk kepentingan internal proyek Cerberus. Gunakan sesuai kebijakan tim Anda.

Jika butuh bantuan lanjut (menambahkan CI, Docker, skrip cross-platform, atau Instruksi macOS/Linux), beri tahu saya — saya akan bantu tambahkan.

---

*Dibuat otomatis berdasarkan draf yang Anda berikan — sudah disusun agar mudah dibaca, diprint, dan dijadikan `tutorial.md`.*

package main

import (
	"bytes"
	"context"
	"crypto/ecdsa" // <-- BARU: Dibutuhkan untuk Kunci Privat
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math/big" // <-- BARU: Dibutuhkan untuk gas/nonce
	"net/http"
	"os"
	"strings"

	"github.com/gin-contrib/cors" // <-- TAMBAHKAN INI
	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/core/types" // <-- BARU: Dibutuhkan untuk membuat transaksi
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/gin-gonic/gin"
)

// --- Variabel Global ---
var contractAddress = common.HexToAddress("0x3A220f351252089D385b29beca14e27F204c296A")
var contractABI abi.ABI
var ethClient *ethclient.Client

// "Buku Tiket" (Nonce Store)
var usedNonces = make(map[string]map[int64]bool)

// Hash Role
var ADMIN_ROLE = crypto.Keccak256Hash([]byte("ADMIN_ROLE"))

// var FINANCE_ROLE = crypto.Keccak256Hash([]byte("FINANCE_ROLE"))
var FINANCE_ROLE = crypto.Keccak256Hash([]byte("ADMIN_ROLE"))
var LOGGER_ROLE = crypto.Keccak256Hash([]byte("LOGGER_ROLE"))

// =================================================================
// === TAMBAHAN BARU: Kunci Privat & Signer untuk "Satpam" ===
// =================================================================
var loggerPrivateKey *ecdsa.PrivateKey
var loggerAddress common.Address
var chainID *big.Int

// =================================================================

// --- Struct AuthRequest (Sama) ---
type AuthRequest struct {
	FromAddress string `json:"fromAddress"`
	Nonce       int64  `json:"nonce"`
}

// --- Fungsi init() (DIPERBARUI) ---
func init() {
	log.Println("Memulai inisialisasi server...")
	gethURL := "http://localhost:8545"
	client, err := ethclient.Dial(gethURL)
	if err != nil {
		log.Fatalf("Gagal terhubung ke Geth: %v", err)
	}
	ethClient = client
	log.Println("✅ Berhasil terhubung ke Geth di localhost:8545!")

	// 1. MEMUAT ABI (Sama)
	abiData, err := os.ReadFile("AuditableRBAC.json")
	if err != nil { /* ... (kode error sama) ... */
	}
	type ContractArtifact struct {
		ABI json.RawMessage `json:"abi"`
	}
	var artifact ContractArtifact
	if err := json.Unmarshal(abiData, &artifact); err != nil { /* ... (kode error sama) ... */
	}
	parsedABI, err := abi.JSON(strings.NewReader(string(artifact.ABI)))
	if err != nil { /* ... (kode error sama) ... */
	}
	contractABI = parsedABI
	log.Println("✅ Berhasil memuat ABI kontrak!")

	// 2. MEMUAT KUNCI PRIVAT LOGGER (BARU)
	// Kita ambil kunci dari akun 0x7156... (yang Anda dapatkan dari decrypt-key.js)
	// !! GANTI INI DENGAN KUNCI PRIVAT ANDA !!
	const SENDER_PRIVATE_KEY = "0xb71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291"

	pk, err := crypto.HexToECDSA(SENDER_PRIVATE_KEY[2:]) // Hapus "0x"
	if err != nil {
		log.Fatalf("Gagal memuat kunci privat logger: %v", err)
	}
	loggerPrivateKey = pk
	loggerAddress = crypto.PubkeyToAddress(pk.PublicKey)
	log.Printf("✅ Logger ('Satpam') akan mengirim transaksi sebagai: %s\n", loggerAddress.Hex())

	// 3. MENGAMBIL CHAIN ID (BARU)
	// Dibutuhkan untuk menandatangani transaksi (EIP-155)
	id, err := ethClient.ChainID(context.Background())
	if err != nil {
		log.Fatalf("Gagal mendapatkan ChainID: %v", err)
	}
	chainID = id
	log.Printf("✅ Berhasil mendapatkan ChainID: %s\n", chainID.String())

	log.Println("--- Inisialisasi Selesai ---")
}

// --- Fungsi Main (DIPERBARUI DENGAN CORS) ---
func main() {
	r := gin.Default()

	// =================================================================
	// === TAMBAHAN BARU UNTUK MEMPERBAIKI "NETWORK ERROR" (CORS) ===
	// =================================================================
	config := cors.DefaultConfig()
	// Hanya izinkan frontend Anda di localhost:3000
	config.AllowOrigins = []string{"http://localhost:3000"} 
	// Izinkan metode POST (untuk mengirim data) dan OPTIONS (untuk pre-flight)
	config.AllowMethods = []string{"GET", "POST", "OPTIONS"} 
	// PENTING: Izinkan header kustom X-Signature Anda
	config.AllowHeaders = []string{"Origin", "Content-Type", "X-Signature"} 
	
	r.Use(cors.New(config))
	// =================================================================

	// Rute Anda yang sudah ada (tidak berubah)
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "pong"})
	})
	r.POST("/api/v1/finance/data", handleFinanceData)
	
	log.Println("Menjalankan server API di http://localhost:8080 ...")
	r.Run(":8080")
}

// --- Handler (Logika API) (DIPERBARUI) ---

func handleFinanceData(c *gin.Context) {
	log.Println("Menerima request ke /api/v1/finance/data")

	// === VERIFIKASI #1: AUTENTIKASI (KTP) ===
	// ... (Tidak ada perubahan, kode Verifikasi #1 sama)
	// === VERIFIKASI #1: AUTENTIKASI (KTP) ===
	bodyBytes, err := c.GetRawData()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Body request tidak valid"})
		return
	}
	c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
	var req AuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format JSON body salah"})
		return
	}

	// === VERIFIKASI #1: AUTENTIKASI (EIP-191) ===
	signatureHex := c.GetHeader("X-Signature")
	if signatureHex == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Header X-Signature tidak ditemukan"})
		return
	}

	// Ubah body mentah kembali menjadi string untuk verifikasi
	bodyString := string(bodyBytes)
	fromAddress := common.HexToAddress(req.FromAddress)

	if !verifyEIP191Signature(signatureHex, bodyString, fromAddress) {
		log.Printf("GAGAL (Verifikasi #1): Tanda tangan EIP-191 tidak valid untuk %s", req.FromAddress)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Tanda tangan tidak valid"})
		return
	}

	recoveredAddress := fromAddress // Kita bisa percaya ini sekarang
	log.Printf("SUKSES (Verifikasi #1): Tanda tangan EIP-191 untuk %s berhasil diverifikasi!", recoveredAddress.Hex())
	// === VERIFIKASI #2: ANTI-REPLAY (Tiket Sekali Pakai) ===
	// ... (Tidak ada perubahan, kode Verifikasi #2 sama)
	userAddr := req.FromAddress
	nonce := req.Nonce
	if usedNonces[userAddr] == nil {
		usedNonces[userAddr] = make(map[int64]bool)
	}
	if usedNonces[userAddr][nonce] {
		log.Printf("GAGAL (Verifikasi #2): Replay attack terdeteksi! Nonce %d sudah dipakai.", nonce)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Replay attack: Nonce sudah digunakan"})
		return
	}
	usedNonces[userAddr][nonce] = true
	log.Printf("SUKSES (Verifikasi #2): Nonce %d diterima.", nonce)

	// === VERIFIKASI #3: OTORISASI (Cek Daftar Undangan) ===
	// ... (Tidak ada perubahan, kode Verifikasi #3 sama)
	callData, err := contractABI.Pack("hasRole", FINANCE_ROLE, recoveredAddress)
	if err != nil {
		log.Fatalf("Gagal pack data untuk panggilan hasRole: %v", err)
	}
	msg := ethereum.CallMsg{To: &contractAddress, Data: callData}
	result, err := ethClient.CallContract(context.Background(), msg, nil)
	if err != nil { /* ... */
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengecek role ke blockchain"})
		return
	}
	var hasRole bool
	if err := contractABI.UnpackIntoInterface(&hasRole, "hasRole", result); err != nil { /* ... */
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membaca hasil cek role"})
		return
	}
	if !hasRole {
		log.Printf("GAGAL (Verifikasi #3): Alamat %s TIDAK PUNYA FINANCE_ROLE", recoveredAddress.Hex())
		c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak: Anda tidak memiliki role yang dibutuhkan"})
		return
	}
	log.Printf("SUKSES (Verifikasi #3): Alamat %s memiliki FINANCE_ROLE!", recoveredAddress.Hex())

	// =================================================================
	// === VERIFIKASI #4: LOGGER ASINKRON ===
	// =================================================================

	// Jalankan ini di 'thread' terpisah (goroutine)
	// Kita tidak menunggu ini selesai.
	go logAccessAsync(recoveredAddress, FINANCE_ROLE)

	// =================================================================
	// === SEMUA VERIFIKASI SELESAI ===
	// =================================================================

	log.Println("MENGIRIM RESPONS 200 OK KE KLIEN...")
	c.JSON(http.StatusOK, gin.H{
		"message":     fmt.Sprintf("Semua verifikasi (AuthN, Nonce, AuthZ) untuk %s berhasil!", recoveredAddress.Hex()),
		"financeData": "Rp 100.000.000",
	})
}

// =================================================================
// === FUNGSI BARU: Logger Asinkron ===
// =================================================================

// Fungsi ini berjalan di latar belakang
func logAccessAsync(userAddress common.Address, roleUsed common.Hash) {
	log.Printf("[Async Logger] Memulai proses logging untuk %s...", userAddress.Hex())

	// 1. Dapatkan Nonce untuk akun LOGGER kita
	// Kita gunakan PendingNonceAt untuk mendapatkan nonce selanjutnya yang valid
	nonce, err := ethClient.PendingNonceAt(context.Background(), loggerAddress)
	if err != nil {
		log.Printf("[Async Logger] GAGAL mendapatkan nonce: %v", err)
		return
	}

	// 2. Dapatkan Harga Gas
	gasPrice, err := ethClient.SuggestGasPrice(context.Background())
	if err != nil {
		log.Printf("[Async Logger] GAGAL mendapatkan gas price: %v", err)
		return
	}

	// 3. Siapkan "data panggilan" untuk fungsi `logAccess(address, bytes32)`
	callData, err := contractABI.Pack("logAccess", userAddress, roleUsed)
	if err != nil {
		log.Printf("[Async Logger] GAGAL pack data logAccess: %v", err)
		return
	}

	// 4. Buat Transaksi
	tx := types.NewTransaction(
		nonce,           // Nonce akun logger
		contractAddress, // Alamat kontrak yang dituju
		big.NewInt(0),   // Tidak mengirim Ether (value = 0)
		uint64(300000),  // Gas Limit (kita set tinggi)
		gasPrice,        // Harga gas
		callData,        // Data panggilan (logAccess)
	)

	// 5. Tanda Tangani Transaksi
	// Kita tandatangani dengan Kunci Privat "Satpam" (logger)
	signedTx, err := types.SignTx(tx, types.NewEIP155Signer(chainID), loggerPrivateKey)
	if err != nil {
		log.Printf("[Async Logger] GAGAL menandatangani tx: %v", err)
		return
	}

	// 6. Kirim Transaksi ke Geth!
	err = ethClient.SendTransaction(context.Background(), signedTx)
	if err != nil {
		log.Printf("[Async Logger] GAGAL mengirim tx: %v", err)
		return
	}

	log.Printf("[Async Logger] SUKSES! Transaksi logging terkirim. Hash: %s", signedTx.Hash().Hex())
}

// =================================================================
// === FUNGSI BARU: Verifikasi Tanda Tangan EIP-191 ===
// =================================================================

// verifyEIP191Signature memverifikasi tanda tangan EIP-191 (standar ethers.js)
func verifyEIP191Signature(signatureHex string, message string, expectedAddress common.Address) bool {
	sig, err := hexutil.Decode(signatureHex)
	if err != nil {
		log.Printf("[EIP191] Gagal decode signature: %v", err)
		return false
	}

	// Ethers.js mengirim V dengan 27/28, Go-ethereum butuh 0/1
	if sig[64] == 27 || sig[64] == 28 {
		sig[64] -= 27
	}

	// Ini adalah "magic" dari EIP-191
	// Kita buat ulang hash yang sama persis seperti yang dibuat ethers.js
	eip191Message := fmt.Sprintf("\x19Ethereum Signed Message:\n%d%s", len(message), message)
	msgHash := crypto.Keccak256Hash([]byte(eip191Message))

	pubKeyBytes, err := crypto.Ecrecover(msgHash.Bytes(), sig)
	if err != nil {
		log.Printf("[EIP191] Gagal ecrecover: %v", err)
		return false
	}

	pubKey, _ := crypto.UnmarshalPubkey(pubKeyBytes)
	recoveredAddress := crypto.PubkeyToAddress(*pubKey)

	return recoveredAddress == expectedAddress
}

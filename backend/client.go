package main

import (
	"bytes"
	"crypto/ecdsa"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
)

// =================================================================
// === KONFIGURASI KLIEN (WAJIB GANTI!) ===
// =================================================================

// GANTI INI DENGAN PRIVATE KEY DARI 3 AKUN BERBEDA DI KEYSTORE ANDA
const ADMIN_PRIVATE_KEY = "0xf7dc752e87753bdfc58ef2ea378c2bc7f21a20da0a3cf386743f6d08c48cabd4"
const FINANCE_PRIVATE_KEY = "0x01bd3d5373318113715da2dfcb3ed9816baf9b13be9ad443c698e0992cd87a8d"
const KARYAWAN_PRIVATE_KEY = "0x54d8d041a84532f2151073772760361d55685338ea1a35ccd2fa4acfa00d237a"

const SERVER_URL = "http://localhost:8080"

// =================================================================

// Struct Request (Harus sama persis dengan di server main.go)
type AuthRequest struct {
	FromAddress string `json:"fromAddress" binding:"required"`
	Message     string `json:"message" binding:"required"`
	Signature   string `json:"signature" binding:"required"`
	Nonce       int64  `json:"nonce" binding:"required"`
}

// Struct untuk Set Budget
type SetBudgetRequest struct {
	AuthRequest        // Ambil field dari AuthRequest
	RoleName    string `json:"roleName" binding:"required"`
	Budget      uint64 `json:"budget" binding:"required"`
}

// =================================================================
// === FUNGSI UTAMA (TEST RUNNER) ===
// =================================================================
func main() {
	log.Println("Memulai Klien Penguji Moli-Milo...")

	// 1. Muat Signer (User)
	adminKey, adminAddr := loadSigner(ADMIN_PRIVATE_KEY)
	financeKey, financeAddr := loadSigner(FINANCE_PRIVATE_KEY)
	karyawanKey, karyawanAddr := loadSigner(KARYAWAN_PRIVATE_KEY)

	log.Printf("Admin: %s", adminAddr.Hex())
	log.Printf("Finance: %s", financeAddr.Hex())
	log.Printf("Karyawan: %s", karyawanAddr.Hex())

	// --- Jalankan Skenario Tes ---
	runTestScenarios(adminKey, adminAddr, financeKey, financeAddr, karyawanKey, karyawanAddr)
}

func runTestScenarios(adminKey *ecdsa.PrivateKey, adminAddr common.Address,
	financeKey *ecdsa.PrivateKey, financeAddr common.Address,
	karyawanKey *ecdsa.PrivateKey, karyawanAddr common.Address) {

	// --- TES SUKSES ---
	log.Println("--- [TES 1: SUKSES] Karyawan mengakses /karyawan/data ---")
	callEndpoint(karyawanKey, karyawanAddr, "/api/v1/karyawan/data")

	log.Println("--- [TES 2: SUKSES] Finance mengakses /finance/laporan ---")
	callEndpoint(financeKey, financeAddr, "/api/v1/finance/laporan")

	log.Println("--- [TES 3: SUKSES] Admin mengakses /admin/dashboard ---")
	callEndpoint(adminKey, adminAddr, "/api/v1/admin/dashboard")

	// --- TES GAGAL (ROLE) ---
	log.Println("--- [TES 4: GAGAL - ROLE] Karyawan mencoba mengakses /finance/laporan ---")
	callEndpoint(karyawanKey, karyawanAddr, "/api/v1/finance/laporan")

	// --- TES GAGAL (REPLAY ATTACK) ---
	log.Println("--- [TES 5: GAGAL - REPLAY ATTACK] Admin mengakses /admin/dashboard 2x ---")
	nonce := time.Now().UnixNano() // Buat 1 nonce
	log.Println("(Percobaan 1: Harusnya SUKSES)")
	callEndpointWithNonce(adminKey, adminAddr, "/api/v1/admin/dashboard", nonce)
	log.Println("(Percobaan 2: Harusnya GAGAL 401 - Nonce used)")
	callEndpointWithNonce(adminKey, adminAddr, "/api/v1/admin/dashboard", nonce) // Kirim nonce yang sama

	// --- TES SUKSES (WRITE TRANSACTION) ---
	log.Println("--- [TES 6: SUKSES - ADMIN] Admin mengatur budget Finance ---")
	callSetBudgetEndpoint(adminKey, adminAddr, "FINANCE_ROLE", 500)

	// --- TES GAGAL (WRITE TRANSACTION DARI ROLE SALAH) ---
	log.Println("--- [TES 7: GAGAL - ROLE] Finance mencoba mengatur budget ---")
	callSetBudgetEndpoint(financeKey, financeAddr, "KARYAWAN_ROLE", 999)

	log.Println("--- PENGUJIAN SELESAI ---")
}

// =================================================================
// === FUNGSI HELPER (Klien & Tanda Tangan) ===
// =================================================================

// callEndpoint adalah helper utama untuk tes Verifikasi 1-5
func callEndpoint(key *ecdsa.PrivateKey, addr common.Address, endpoint string) {
	nonce := time.Now().UnixNano()
	callEndpointWithNonce(key, addr, endpoint, nonce)
}

func callEndpointWithNonce(key *ecdsa.PrivateKey, addr common.Address, endpoint string, nonce int64) {
	// 1. Siapkan Message & Signature
	// Pesan ini harus ditandatangani (sesuai verifikasi #1 di server)
	message := fmt.Sprintf("Moli-Milo_Auth_Nonce_%d", nonce)
	signature, err := signEIP191(key, message)
	if err != nil {
		log.Printf("ERROR sign: %v", err)
		return
	}

	// 2. Siapkan Payload (Body JSON)
	reqBody := AuthRequest{
		FromAddress: addr.Hex(),
		Message:     message,
		Signature:   signature,
		Nonce:       nonce,
	}
	payload, _ := json.Marshal(reqBody)

	// 3. Kirim Request
	sendRequest(endpoint, payload)
}

// callSetBudgetEndpoint adalah helper untuk tes Admin Set Budget
func callSetBudgetEndpoint(key *ecdsa.PrivateKey, addr common.Address, roleName string, budget uint64) {
	nonce := time.Now().UnixNano()
	message := fmt.Sprintf("Moli-Milo_Auth_Nonce_%d", nonce)
	signature, err := signEIP191(key, message)
	if err != nil {
		log.Printf("ERROR sign: %v", err)
		return
	}

	// 2. Siapkan Payload (Body JSON)
	reqBody := SetBudgetRequest{
		AuthRequest: AuthRequest{ // Nested Auth
			FromAddress: addr.Hex(),
			Message:     message,
			Signature:   signature,
			Nonce:       nonce,
		},
		RoleName: roleName,
		Budget:   budget,
	}
	payload, _ := json.Marshal(reqBody)

	// 3. Kirim Request
	sendRequest("/api/v1/admin/budget", payload)
}

// sendRequest adalah fungsi HTTP POST
func sendRequest(endpoint string, payload []byte) {
	url := SERVER_URL + endpoint
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(payload))
	if err != nil {
		log.Printf("ERROR create req: %v", err)
		return
	}
	req.Header.Set("Content-Type", "application/json")

	// Kirim request
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("ERROR do req: %v", err)
		return
	}
	defer resp.Body.Close()

	// Baca dan cetak respons
	respBody, _ := io.ReadAll(resp.Body)
	log.Printf("==> Respons Server (Status: %s): %s\n", resp.Status, string(respBody))
}

// signEIP191 membuat tanda tangan EIP-191 (ethers.js compatible)
func signEIP191(privateKey *ecdsa.PrivateKey, message string) (string, error) {
	// Ini adalah "magic" EIP-191
	eip191Message := fmt.Sprintf("\x19Ethereum Signed Message:\n%d%s", len(message), message)
	msgHash := crypto.Keccak256Hash([]byte(eip191Message))

	sig, err := crypto.Sign(msgHash.Bytes(), privateKey)
	if err != nil {
		return "", err
	}

	// Ubah V dari 0/1 (Go) menjadi 27/28 (Ethers.js/JSON-RPC)
	sig[64] += 27
	return hexutil.Encode(sig), nil
}

// loadSigner memuat kunci privat dan mengembalikan alamatnya
func loadSigner(keyHex string) (*ecdsa.PrivateKey, common.Address) {
	if keyHex == "0x...ganti_dengan_private_key_admin_anda..." ||
		keyHex == "0x...ganti_dengan_private_key_finance_anda..." ||
		keyHex == "0x...ganti_dengan_private_key_karyawan_anda..." {
		log.Fatal("❌ FATAL: Harap ganti placeholder PRIVATE_KEY di client_test.go!")
	}

	key, err := crypto.HexToECDSA(strings.TrimPrefix(keyHex, "0x"))
	if err != nil {
		log.Fatalf("Gagal memuat private key: %v", err)
	}
	addr := crypto.PubkeyToAddress(key.PublicKey)
	return key, addr
}

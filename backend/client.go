package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"time"

	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
)

// Ganti dengan Kunci Privat dari akun yang punya ADMIN_ROLE
// (Kunci yang sama dengan SENDER_PRIVATE_KEY di file lama Anda)
const SENDER_PRIVATE_KEY = "0xb71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291"

// URL "Satpam" Go Anda
const API_URL = "http://localhost:8080/api/v1/finance/data"

// Struct yang sama persis dengan yang ada di main.go
type AuthRequest struct {
	FromAddress string `json:"fromAddress"`
	Nonce       int64  `json:"nonce"`
}

func main() {
	// 1. Muat Kunci Privat (Sama)
	privateKey, err := crypto.HexToECDSA(SENDER_PRIVATE_KEY[2:]) // Hapus "0x"
	if err != nil {
		log.Fatalf("Gagal memuat kunci privat: %v", err)
	}
	senderAddress := crypto.PubkeyToAddress(privateKey.PublicKey)
	log.Printf("Mengirim request sebagai: %s\n", senderAddress.Hex())

	// 2. Siapkan Pesan (Body) (Sama)
	body := AuthRequest{
		FromAddress: senderAddress.Hex(),
		Nonce:       time.Now().Unix(), // Gunakan timestamp sebagai Nonce
	}
	bodyBytes, err := json.Marshal(body)
	if err != nil {
		log.Fatalf("Gagal membuat JSON body: %v", err)
	}
	// Kita butuh body sebagai string, bukan hanya bytes
	bodyString := string(bodyBytes)
	log.Printf("Body JSON: %s\n", bodyString)

	// =================================================================
	// === PERUBAHAN DI SINI (LANGKAH 3) ===
	// =================================================================

	// 3. Buat "Sidik Jari" (Hash) - VERSI EIP-191 BARU
	// Kita buat ulang hash yang sama persis seperti yang dibuat ethers.js
	eip191Message := fmt.Sprintf("\x19Ethereum Signed Message:\n%d%s", len(bodyString), bodyString)
	msgHash := crypto.Keccak256Hash([]byte(eip191Message))
	log.Println("Membuat hash EIP-191...")

	// 4. Tanda Tangani (Sign) HASH-nya (Sama)
	// Kita menandatangani hash EIP-191 yang baru
	signatureBytes, err := crypto.Sign(msgHash.Bytes(), privateKey)
	if err != nil {
		log.Fatalf("Gagal menandatangani pesan: %v", err)
	}
	signatureBytes[64] += 27 // Perbaiki 'v' (Sama)
	signatureHex := hexutil.Encode(signatureBytes)
	log.Printf("Signature: %s\n", signatureHex)

	// 5. Kirim Request (Sama)
	req, err := http.NewRequest("POST", API_URL, bytes.NewBuffer(bodyBytes))
	if err != nil {
		log.Fatalf("Gagal membuat request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Signature", signatureHex) // <-- KTP DIGITAL KITA

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Fatalf("Gagal mengirim request: %v", err)
	}
	defer resp.Body.Close()

	// Baca respons dari server (Sama)
	respBody, _ := ioutil.ReadAll(resp.Body)

	fmt.Println("\n--- Respons Server ---")
	fmt.Printf("Status: %s\n", resp.Status)
	fmt.Printf("Body: %s\n", string(respBody))
}
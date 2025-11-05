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

// KUNCI PRIVAT STANDAR UNTUK --dev (menghasilkan 0xf39...)
// Geth --dev Anda tidak menggunakan ini, ia menggunakan akun 0x7156...
// Kita HARUS menggunakan Kunci Privat untuk 0x7156...

// !! GANTI INI !!
// Ganti dengan Kunci Privat dari akun 0x7156...17f7 Anda
// (Kunci privat yang Anda dapatkan dari decrypt-key.js)
const SENDER_PRIVATE_KEY = "0xb71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291"

// URL "Satpam" Go Anda
const API_URL = "http://localhost:8080/api/v1/finance/data"

// Ini adalah struct yang SAMA PERSIS dengan yang ada di main.go
type AuthRequest struct {
	FromAddress string `json:"fromAddress"`
	Nonce       int64  `json:"nonce"`
}

func main() {
	// 1. Muat Kunci Privat
	privateKey, err := crypto.HexToECDSA(SENDER_PRIVATE_KEY[2:]) // Hapus "0x"
	if err != nil {
		log.Fatalf("Gagal memuat kunci privat: %v", err)
	}

	// Dapatkan alamat publik kita dari kunci privat
	senderAddress := crypto.PubkeyToAddress(privateKey.PublicKey)
	log.Printf("Mengirim request sebagai: %s\n", senderAddress.Hex())

	// 2. Siapkan Pesan (Body)
	body := AuthRequest{
		FromAddress: senderAddress.Hex(),
		Nonce:       time.Now().Unix(), // Gunakan timestamp sebagai Nonce
	}
	bodyBytes, err := json.Marshal(body)
	if err != nil {
		log.Fatalf("Gagal membuat JSON body: %v", err)
	}
	log.Printf("Body JSON: %s\n", string(bodyBytes))

	// 3. Buat "Sidik Jari" (Hash) - SAMA PERSIS DENGAN SERVER
	msgHash := crypto.Keccak256Hash(bodyBytes)

	// 4. Tanda Tangani (Sign) HASH-nya
	signatureBytes, err := crypto.Sign(msgHash.Bytes(), privateKey)
	if err != nil {
		log.Fatalf("Gagal menandatangani pesan: %v", err)
	}

	// Perbaiki 'v' (byte ke-64) agar sesuai dengan standar Ethereum (27/28)
	signatureBytes[64] += 27
	signatureHex := hexutil.Encode(signatureBytes)
	log.Printf("Signature: %s\n", signatureHex)

	// 5. Kirim Request
	// Buat request HTTP baru
	req, err := http.NewRequest("POST", API_URL, bytes.NewBuffer(bodyBytes))
	if err != nil {
		log.Fatalf("Gagal membuat request: %v", err)
	}

	// Tambahkan header
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Signature", signatureHex) // <-- KTP DIGITAL KITA

	// Kirim!
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Fatalf("Gagal mengirim request: %v", err)
	}
	defer resp.Body.Close()

	// Baca respons dari server
	respBody, _ := ioutil.ReadAll(resp.Body)

	fmt.Println("\n--- Respons Server ---")
	fmt.Printf("Status: %s\n", resp.Status)
	fmt.Printf("Body: %s\n", string(respBody))
}

// ./backend/blockchain/client.go
package blockchain

import (
	"context"
	"log"
	"math/big"

	"moli-milo/config"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
)

// Global client connection
var Client *ethclient.Client

// Global bound contract instance
var RBAC *AuditableRBAC // Ganti AuditableRBAC dengan nama file yang akan digenerate

// ConnectClient menghubungkan ke Geth RPC dan mengikat kontrak
func ConnectClient() {
	var err error

	// 1. Hubungkan ke Geth Node
	Client, err = ethclient.Dial(config.GethRPCUrl)
	if err != nil {
		log.Fatalf("Gagal terhubung ke Geth RPC: %v", err)
	}
	log.Println("✅ Berhasil terhubung ke Geth RPC.")

	// 2. Buat instance Smart Contract
	contractAddress := common.HexToAddress(config.RBACContractAddress)

	// Ganti 'AuditableRBAC' dengan nama struct yang akan di-generate oleh 'abigen'
	// Asumsi: Anda sudah meng-generate file binding-nya.
	RBAC, err = NewAuditableRBAC(contractAddress, Client)
	if err != nil {
		log.Fatalf("Gagal membuat instance kontrak: %v", err)
	}
	log.Println("✅ Smart Contract diikat.")

	// Optional: Cek ChainID
	chainID, _ := Client.ChainID(context.Background())
	log.Printf("Chain ID Geth: %v (Harusnya 1337)", chainID)
}

// GetTransactOpts mengembalikan opsi transaksi untuk akun Logger/Admin
func GetTransactOpts(value *big.Int) *bind.TransactOpts {
	// ⚠️ WARNING: Di sini Anda perlu membaca password.txt dan membuka kunci akun
	// Secara sederhana, kita bisa menggunakan nil dan mengandalkan Geth karena akun sudah di-unlock
	// Tapi di aplikasi nyata, ini butuh logika otentikasi lebih.

	// Karena akun sudah di-unlock di run-node.bat, kita bisa pakai nil
	// TAPI pastikan Geth Anda sudah diset untuk mengizinkan transaksi dari akun yang di-unlock tersebut

	opts := &bind.TransactOpts{
		From:    config.LoggerSigner,
		Value:   value,
		Context: context.Background(),
	}
	return opts
}

// helpers/policy.go
package helpers

import (
	"moli-milo/config"
	"time"
)

// CheckPolicyServerSide mengecek jam kerja berdasarkan role
func CheckPolicyServerSide(roleHash string) bool {
	// Tentukan zona waktu WIB (UTC+7)
	wibLocation, _ := time.LoadLocation("Asia/Jakarta")
	nowInWIB := time.Now().In(wibLocation)
	currentHour := nowInWIB.Hour() // Angka 0-23

	switch roleHash {
	case config.ADMIN_ROLE:
		return true // Admin selalu boleh
	case config.FINANCE_ROLE:
		// Finance: 08:00 (inklusif) s/d 20:00 (eksklusif)
		return currentHour >= 8 && currentHour < 20
	case config.KARYAWAN_ROLE:
		// Karyawan: 08:00 (inklusif) s/d 17:00 (eksklusif)
		return currentHour >= 8 && currentHour < 17
	default:
		return false // Role tidak dikenal/tidak diizinkan
	}
}

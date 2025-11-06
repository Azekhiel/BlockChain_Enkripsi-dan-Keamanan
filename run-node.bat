@echo off
echo ==========================================
echo Menjalankan Node Geth (Mode KUSTOM PoA)
echo ==========================================
echo Jangan tutup jendela ini.
echo.
echo Node ini akan otomatis unlock dan mining.
echo.

rem Perintah Geth v1.10.x
geth --datadir .\chaindata ^
--networkid 1337 ^
--nodiscover ^
--http ^
--http.addr "localhost" ^
--http.port 8545 ^
--http.api "eth,net,web3" ^
--ipcpath \\.\pipe\chaindata\geth.ipc ^
--password ./password.txt ^
--unlock "0x153A5212b0eA63239021410dfa864c373a254F2c" ^
--allow-insecure-unlock ^
--miner.etherbase "0x153A5212b0eA63239021410dfa864c373a254F2c" ^
--mine

echo.
echo Node Geth dihentikan.
pause
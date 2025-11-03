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
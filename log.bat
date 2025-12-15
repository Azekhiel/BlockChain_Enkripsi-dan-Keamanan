@echo off
echo ============================================
echo == 🔎 Menampilkan Log Audit dari Blockchain ==
echo ============================================
echo Menghubungkan ke node Geth dan mengambil logs...
echo.

rem Perintah ini menghubungkan ke Geth, menjalankan JavaScript (--exec), lalu keluar.
rem Kita gunakan ' sebagai ganti " di dalam JavaScript agar tidak konflik.
geth attach \\.\pipe\chaindata\geth.ipc --exec "var topic = web3.sha3('AccessLogged(address,bytes32,uint256)'); var filter = eth.newFilter({fromBlock: 0, toBlock: 'latest', address: '0xd4766aFBe333DB354C61628f9229f63f45c12C26', topics: [topic]}); var logs = eth.getFilterLogs(filter); console.log('--- Menampilkan ' + logs.length + ' Log Audit dari Blockchain ---'); console.log(JSON.stringify(logs, null, 2));"

echo.
echo Pengambilan log selesai.
pause
// pages/index.tsx
import { useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import toast from 'react-hot-toast';

// Helper untuk Cek apakah window.ethereum (MetaMask) ada
const getProvider = () => {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    return new ethers.BrowserProvider((window as any).ethereum);
  }
  return null;
};

export default function Home() {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [financeData, setFinanceData] = useState<string | null>(null);

  // --- Fungsi untuk Tombol Connect Wallet ---
  const connectWallet = async () => {
    const provider = getProvider();
    if (!provider) {
      toast.error('MetaMask tidak terdeteksi. Silakan install MetaMask.');
      return;
    }
    try {
      const accounts = await provider.send('eth_requestAccounts', []);
      setAddress(accounts[0]);
      toast.success('Wallet terhubung!');
    } catch (error) {
      console.error(error);
      toast.error('Gagal menghubungkan wallet.');
    }
  };

  // --- Ini adalah ALUR INTI "CERBERUS" di sisi KLIEN ---
  const callProtectedApi = async () => {
    if (!address) {
      toast.error('Harap hubungkan wallet Anda terlebih dahulu.');
      return;
    }

    const provider = getProvider();
    if (!provider) return;

    setLoading(true);
    setFinanceData(null);
    const toastId = toast.loading('Memproses permintaan...'); // <-- Notifikasi 1

    try {
      const signer = await provider.getSigner();

      // 1. Buat Body (sesuai AuthRequest di Go)
      // Kita gunakan Date.now() sebagai nonce simpel
      const nonce = Date.now();
      const body = {
        fromAddress: address,
        nonce: nonce,
      };
      const bodyString = JSON.stringify(body);

      // 2. Tanda Tangani Body (Minta Tanda Tangan EIP-191)
      // Ini akan memicu pop-up MetaMask "Signature Request"
      const signature = await signer.signMessage(bodyString);

      // 3. Panggil API Backend Go Anda
      // URL ini harus sesuai dengan backend Go Anda (http://localhost:8080)
      const response = await axios.post(
        'http://localhost:8080/api/v1/finance/data',
        body, // Kita kirim JSON body
        {
          headers: {
            'X-Signature': signature, // dan tanda tangan EIP-191 di header
            'Content-Type': 'application/json',
          },
        }
      );

      // 4. Tampilkan Hasil
      setFinanceData(response.data.financeData);
      toast.success('Sukses! Data keuangan diterima.', { id: toastId }); // <-- Notifikasi 2 (Sukses)
    
    } catch (error: any) {
      console.error(error);
      // Ini akan menampilkan pesan error langsung dari backend Go Anda!
      const errorMessage =
        error.response?.data?.error || error.message || 'Terjadi kesalahan';
      toast.error(`Gagal: ${errorMessage}`, { id: toastId }); // <-- Notifikasi 2 (Gagal)
    } finally {
      setLoading(false);
    }
  };

  // --- Ini adalah Tampilan (JSX + Tailwind) ---
  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-900 p-12 text-white">
      <div className="w-full max-w-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">🛡️ Dashboard Cerberus</h1>
          {address ? (
            <div className="p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm font-mono">
              {`✅ Terhubung: ${address.substring(0, 6)}...${address.substring(
                address.length - 4
              )}`}
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="px-4 py-2 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Connect Wallet
            </button>
          )}
        </div>

        {/* Main Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-4">Akses Endpoint Terproteksi</h2>
          <p className="text-gray-400 mb-6">
            Panggil endpoint `/api/v1/finance/data`. Ini akan meminta tanda tangan 
            untuk membuktikan kepemilikan dompet Anda (Otentikasi EIP-191).
          </p>
          <button
            onClick={callProtectedApi}
            disabled={!address || loading}
            className="w-full px-4 py-3 bg-green-600 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Memverifikasi...' : 'Ambil Data Keuangan'}
          </button>

          {/* Result Area */}
          {financeData && (
            <div className="mt-6 p-4 bg-gray-900 border border-gray-700 rounded-lg">
              <h3 className="font-semibold text-green-400">Data Diterima dari Backend:</h3>
              <pre className="text-white mt-2 font-mono">{financeData}</pre>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
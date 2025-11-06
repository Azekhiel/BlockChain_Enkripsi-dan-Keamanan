// pages/index.tsx
import { useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion'; // <-- Impor Animasi

// --- Ikon SVG Keren (Biar "Pick Me") ---
const IconSpinner = () => (
  <svg
    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);
const IconKaryawan = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A1.75 1.75 0 0115.5 22H8.5a1.75 1.75 0 01-1.75-1.75 7.5 7.5 0 01-2.249-.132z" /></svg>;
const IconFinance = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75C2.25 5.01 2.76 4.5 3.51 4.5h.75a.75.75 0 01.75.75v.75m0 0h.75m-.75 0a.75.75 0 00-.75.75v.75c0 .414.336.75.75.75h.75m0 0v-.75a.75.75 0 00-.75-.75h-.75M9 4.5v.75a.75.75 0 01-.75.75H7.5m0 0v-.75A.75.75 0 018.25 4.5h.75a.75.75 0 01.75.75v.75m0 0h.75m-.75 0a.75.75 0 00-.75.75v.75c0 .414.336.75.75.75h.75m0 0v-.75a.75.75 0 00-.75-.75h-.75m-6 3.75v.75a.75.75 0 01-.75.75H4.5m0 0v-.75a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75m0 0h.75m-.75 0a.75.75 0 00-.75.75v.75c0 .414.336.75.75.75h.75m0 0v-.75a.75.75 0 00-.75-.75h-.75m-6 3.75v.75a.75.75 0 01-.75.75H4.5m0 0v-.75a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75m0 0h.75m-.75 0a.75.75 0 00-.75.75v.75c0 .414.336.75.75.75h.75m0 0v-.75a.75.75 0 00-.75-.75h-.75m10.5-3.75v.75a.75.75 0 01-.75.75h-.75m0 0v-.75a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75m0 0h.75m-.75 0a.75.75 0 00-.75.75v.75c0 .414.336.75.75.75h.75m0 0v-.75a.75.75 0 00-.75-.75h-.75M13.5 9.75v.75a.75.75 0 01-.75.75h-.75m0 0v-.75a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75m0 0h.75m-.75 0a.75.75 0 00-.75.75v.75c0 .414.336.75.75.75h.75m0 0v-.75a.75.75 0 00-.75-.75h-.75M13.5 15.75v.75a.75.75 0 01-.75.75h-.75m0 0v-.75a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75m0 0h.75m-.75 0a.75.75 0 00-.75.75v.75c0 .414.336.75.75.75h.75m0 0v-.75a.75.75 0 00-.75-.75h-.75m-6-3.75v.75a.75.75 0 01-.75.75H7.5m0 0v-.75a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75m0 0h.75m-.75 0a.75.75 0 00-.75.75v.75c0 .414.336.75.75.75h.75m0 0v-.75a.75.75 0 00-.75-.75h-.75" /></svg>;
const IconAdmin = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.413-.293-2.764-.835-4.018A11.962 11.962 0 0018 6.035 11.959 11.959 0 0015 2.714z" /></svg>;
const IconSettings = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.108 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.11v1.093c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.108 1.204l.527.738c.32.447.27.96-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.204-.108-.397.165-.71.505-.78.93l-.15.893c-.09.543-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.149-.893c-.07-.424-.384-.764-.78-.93-.398-.164-.854-.142-1.204.108l-.738.527a1.125 1.125 0 01-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.11v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.205.108.397-.165.71-.505.78-.93l.15-.893z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

// --- Tipe State Loading BARU ---
type LoadingState = null | 'karyawan' | 'finance' | 'admin' | 'setBudget';

// Helper untuk Cek apakah window.ethereum (MetaMask) ada
const getProvider = () => {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    return new ethers.BrowserProvider((window as any).ethereum);
  }
  return null;
};

// Tipe data untuk AuthRequest (sesuai main.go)
interface AuthBody {
  fromAddress: string;
  message: string;
  nonce: number;
}

// Tipe data untuk SetBudget (sesuai main.go)
interface SetBudgetBody extends AuthBody {
  roleName: string;
  budget: number;
}

export default function Home() {
  const [address, setAddress] = useState<string | null>(null);
  // --- State Loading Di-upgrade ---
  const [loading, setLoading] = useState<LoadingState>(null);
  const [responseData, setResponseData] = useState<string | null>(null);
  const [copied, setCopied] = useState(false); // Untuk tombol "Copy"

  // --- Fungsi Wallet (Sama) ---
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

  // --- Fungsi untuk Tombol Disconnect ---
  const disconnectWallet = () => {
    setAddress(null);
    setResponseData(null); // Bersihkan juga respons lama
    toast.success('Wallet terputus!');
  };  

  // --- FUNGSI HELPER UTAMA (Panggil API) - Di-upgrade ---
  const callApi = async (
    endpoint: string,
    body: AuthBody | SetBudgetBody,
    roleKey: LoadingState // <-- Terima roleKey untuk state loading
  ) => {
    setLoading(roleKey); // <-- Set state loading spesifik
    setResponseData(null);
    const toastId = toast.loading(`[${roleKey}] Memverifikasi...`);

    // 1. Dapatkan tanda tangan (HANYA DARI MESSAGE)
    // (Logika ini sudah benar dari perbaikan sebelumnya)
    const provider = getProvider();
    if (!provider || !address) {
      toast.error('Wallet tidak terhubung.', { id: toastId });
      setLoading(null);
      return;
    }

    let signature: string;
    try {
      const signer = await provider.getSigner();
      const messageToSign = body.message;
      signature = await signer.signMessage(messageToSign);
    } catch (error) {
      toast.error('Tanda tangan dibatalkan.', { id: toastId });
      setLoading(null);
      return;
    }

    // 2. MASUKKAN TANDA TANGAN KE DALAM BODY JSON
    // (Logika ini sudah benar dari perbaikan sebelumnya)
    const bodyWithSignature = {
      ...body,
      signature: signature,
    };

    try {
      // 3. Panggil API Backend Go Anda
      const response = await axios.post(
        `http://localhost:8080${endpoint}`,
        bodyWithSignature,
        { headers: { 'Content-Type': 'application/json' } }
      );

      // 4. Tampilkan Hasil (Sukses)
      setResponseData(JSON.stringify(response.data, null, 2));
      toast.success(`[${roleKey}] Sukses! Respons diterima.`, { id: toastId });
    } catch (error: any) {
      // 4. Tampilkan Hasil (Gagal)
      const errorMessage =
        error.response?.data?.error || error.message || 'Terjadi kesalahan';
      setResponseData(
        JSON.stringify(error.response?.data || error.message, null, 2)
      );
      toast.error(`[${roleKey}] Gagal: ${errorMessage}`, { id: toastId });
    } finally {
      setLoading(null); // <-- Reset state loading
    }
  };

  // --- FUNGSI PER ROLE (Di-upgrade) ---
  const handleKaryawanAccess = () => {
    if (!address) return;
    const body: AuthBody = {
      fromAddress: address,
      message: `Moli-Milo_Auth_Nonce_${Date.now()}`,
      nonce: Date.now(),
    };
    callApi('/api/v1/karyawan/data', body, 'karyawan');
  };

  const handleFinanceAccess = () => {
    if (!address) return;
    const body: AuthBody = {
      fromAddress: address,
      message: `Moli-Milo_Auth_Nonce_${Date.now()}`,
      nonce: Date.now(),
    };
    callApi('/api/v1/finance/laporan', body, 'finance');
  };

  const handleAdminDashboard = () => {
    if (!address) return;
    const body: AuthBody = {
      fromAddress: address,
      message: `Moli-Milo_Auth_Nonce_${Date.now()}`,
      nonce: Date.now(),
    };
    callApi('/api/v1/admin/dashboard', body, 'admin');
  };

  const handleAdminSetBudget = () => {
    if (!address) return;
    const body: SetBudgetBody = {
      fromAddress: address,
      message: `Moli-Milo_Auth_Nonce_${Date.now()}`,
      nonce: Date.now(),
      roleName: 'FINANCE_ROLE', // Hardcode untuk tes
      budget: 500, // Hardcode untuk tes
    };
    callApi('/api/v1/admin/budget', body, 'setBudget');
  };

  // --- Fungsi "Copy" BARU ---
  const handleCopy = () => {
    if (!responseData) return;
    navigator.clipboard.writeText(responseData);
    setCopied(true);
    toast.success('Disalin ke clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Tampilan (JSX + Tailwind) - Di-upgrade ---
  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-br from-gray-900 to-gray-950 p-6 md:p-12 text-white">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            🛡️ Moli-Milo Dashboard
          </h1>
          {address ? (
            <div className="flex items-center space-x-2">
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm font-mono"
              >
                {`✅ ${address.substring(0, 6)}...${address.substring(
                  address.length - 4
                )}`}
              </motion.div>
              <button
                onClick={disconnectWallet}
                title="Disconnect"
                className="px-3 py-2 bg-red-600 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                X
              </button>
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

        {/* =================================== */}
        {/* === Grid Aksi 2x2 BARU === */}
        {/* =================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Karyawan */}
          <RoleCard
            title="Area Karyawan"
            description="Tes: Coba akses `/api/v1/karyawan/data`"
            buttonText="1. Ambil Data Karyawan"
            Icon={IconKaryawan}
            color="blue"
            onClick={handleKaryawanAccess}
            loading={loading === 'karyawan'}
            disabled={!address || !!loading}
          />

          {/* Card Finance */}
          <RoleCard
            title="Area Finance"
            description="Tes: Coba akses `/api/v1/finance/laporan`"
            buttonText="2. Ambil Laporan Keuangan"
            Icon={IconFinance}
            color="green"
            onClick={handleFinanceAccess}
            loading={loading === 'finance'}
            disabled={!address || !!loading}
          />

          {/* Card Admin Dashboard */}
          <RoleCard
            title="Admin: Dashboard"
            description="Tes: Coba akses `/api/v1/admin/dashboard`"
            buttonText="3. Ambil Data Dashboard"
            Icon={IconAdmin}
            color="red"
            onClick={handleAdminDashboard}
            loading={loading === 'admin'}
            disabled={!address || !!loading}
          />

          {/* Card Admin Set Budget */}
          <RoleCard
            title="Admin: Set Budget (Write)"
            description="Tes: Coba akses `/api/v1/admin/budget`"
            buttonText="4. Set Budget Finance = 500"
            Icon={IconSettings}
            color="yellow"
            onClick={handleAdminSetBudget}
            loading={loading === 'setBudget'}
            disabled={!address || !!loading}
          />
        </div>

        {/* Result Area (Dengan Animasi) */}
        <AnimatePresence>
          {responseData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-8 p-4 bg-gray-950 border border-gray-700 rounded-lg relative"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-400">
                  Respons Mentah dari Backend:
                </h3>
                <button
                  onClick={handleCopy}
                  className="text-sm bg-gray-700 px-2 py-1 rounded hover:bg-gray-600 transition-colors"
                >
                  {copied ? 'Disalin!' : 'Copy'}
                </button>
              </div>
              <pre className="text-white mt-2 font-mono text-sm whitespace-pre-wrap break-all">
                {responseData}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

// ===================================
// === Komponen Kartu (BARU) ===
// ===================================
// Ini adalah komponen React baru untuk membuat UI lebih bersih
type RoleCardProps = {
  title: string;
  description: string;
  buttonText: string;
  Icon: () => JSX.Element;
  color: 'blue' | 'green' | 'red' | 'yellow';
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
};

function RoleCard({
  title,
  description,
  buttonText,
  Icon,
  color,
  onClick,
  loading,
  disabled,
}: RoleCardProps) {
  // --- Tailwind Magic untuk warna dinamis ---
  const colorClasses = {
    blue: {
      border: 'border-blue-500/30 hover:border-blue-500/80',
      button: 'bg-blue-600 hover:bg-blue-700',
    },
    green: {
      border: 'border-green-500/30 hover:border-green-500/80',
      button: 'bg-green-600 hover:bg-green-700',
    },
    red: {
      border: 'border-red-500/30 hover:border-red-500/80',
      button: 'bg-red-600 hover:bg-red-700',
    },
    yellow: {
      border: 'border-yellow-500/30 hover:border-yellow-500/80',
      button: 'bg-yellow-600 hover:bg-yellow-700 text-black', // Teks hitam agar kontras
    },
  };
  
  return (
    <motion.div
      className={`bg-gray-800/50 backdrop-blur-sm border rounded-lg p-6 shadow-xl transition-colors ${colorClasses[color].border}`}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-xl font-semibold mb-2 flex items-center">
        <Icon /> {title}
      </h2>
      <p className="text-gray-400 mb-4 text-sm">{description}</p>
      <motion.button
        onClick={onClick}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center justify-center ${colorClasses[color].button}`}
        whileTap={{ scale: 0.98 }}
      >
        {loading ? (
          <>
            <IconSpinner /> Memverifikasi...
          </>
        ) : (
          buttonText
        )}
      </motion.button>
    </motion.div>
  );
}
// pages/_app.tsx
import '@/styles/globals.css'; // <-- Baris ini PENTING untuk Tailwind
import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast'; // <-- Impor notifikasi

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Provider Notifikasi Modern.
        Ini yang akan memunculkan pop-up "Sukses" atau "Gagal".
      */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      
      {/* Ini adalah halaman Anda (misal: index.tsx) */}
      <Component {...pageProps} />
    </>
  );
}
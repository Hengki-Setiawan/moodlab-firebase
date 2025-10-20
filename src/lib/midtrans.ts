import midtransClient from 'midtrans-client';

// Ambil server key dari environment variables.
const serverKey = process.env.MIDTRANS_SERVER_KEY;

// Validasi bahwa server key ada.
if (!serverKey) {
  console.warn('Peringatan: MIDTRANS_SERVER_KEY tidak diatur di environment variables.');
}

// Buat instance baru dari Midtrans CoreApi client untuk transaksi dari sisi server.
// 'isProduction' diatur ke false untuk lingkungan pengembangan/sandbox.
// Ganti menjadi true saat aplikasi Anda siap untuk transaksi live (menggunakan key produksi).
export const coreApi = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: serverKey,
});

import midtransClient from 'midtrans-client';

// Ambil server key dan client key dari environment variables.
const serverKey = process.env.MIDTRANS_SERVER_KEY;
const clientKey = process.env.MIDTRANS_CLIENT_KEY;

// Validasi bahwa server key dan client key ada.
if (!serverKey || !clientKey) {
  console.warn('Peringatan: MIDTRANS_SERVER_KEY atau MIDTRANS_CLIENT_KEY tidak diatur di environment variables.');
}

// Buat instance baru dari Midtrans Snap client.
// 'isProduction' diatur ke false untuk lingkungan pengembangan/sandbox.
// Ganti menjadi true saat aplikasi Anda siap untuk transaksi live.
export const snap = new midtransClient.Snap({
  isProduction: false, // Set ke `true` untuk mode produksi
  serverKey: serverKey,
  clientKey: clientKey,
});

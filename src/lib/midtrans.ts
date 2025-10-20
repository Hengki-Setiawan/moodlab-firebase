import midtransClient from 'midtrans-client';

const serverKey = process.env.MIDTRANS_SERVER_KEY;
const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

if (!serverKey || !clientKey) {
  // We still check for both to ensure they are set, but only use serverKey for Snap backend instance.
  console.warn('Midtrans server key or client key might not be set in environment variables.');
}

export const snap = new midtransClient.Snap({
  isProduction: false, // Set to true for production
  serverKey: serverKey,
  // clientKey is not needed for server-side Snap instance creation.
  // Including it can sometimes cause auth issues depending on the library version and context.
});

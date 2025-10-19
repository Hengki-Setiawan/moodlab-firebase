import midtransClient from 'midtrans-client';

const serverKey = process.env.MIDTRANS_SERVER_KEY;
// Updated to use the correct environment variable name for the client key
const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

if (!serverKey || !clientKey) {
  throw new Error('Midtrans server key or client key is not set in environment variables.');
}

export const snap = new midtransClient.Snap({
  isProduction: false, // Set to true for production
  serverKey: serverKey,
  clientKey: clientKey
});

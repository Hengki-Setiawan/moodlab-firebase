import midtransClient from 'midtrans-client';

const serverKey = process.env.MIDTRANS_SERVER_KEY;
const clientKey = process.env.MIDTRANS_CLIENT_KEY;

if (!serverKey || !clientKey) {
  throw new Error('Midtrans server key or client key is not set in environment variables.');
}

export const snap = new midtransClient.Snap({
  isProduction: false, // Set to true for production
  serverKey: serverKey,
  clientKey: clientKey
});

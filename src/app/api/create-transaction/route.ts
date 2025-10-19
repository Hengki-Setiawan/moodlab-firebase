import { NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';
import dotenv from 'dotenv';

// Muat variabel lingkungan dari file .env di folder functions
// Ini hanya untuk pengembangan lokal. Di Vercel, Anda akan mengatur ini di dasbor.
dotenv.config({ path: 'functions/.env' });


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, amount, productName, productId, customerEmail } = body;

    if (!orderId || !amount || !productName || !productId || !customerEmail) {
      return NextResponse.json({ message: 'Data tidak lengkap.' }, { status: 400 });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

    if (!serverKey || !clientKey) {
        throw new Error("Kunci Midtrans tidak dikonfigurasi di environment variables.");
    }


    // Inisialisasi Midtrans Snap
    const snap = new midtransClient.Snap({
      isProduction: false, // Set ke true di lingkungan produksi
      serverKey: serverKey,
      clientKey: clientKey,
    });

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      item_details: [
        {
          id: productId,
          price: amount,
          quantity: 1,
          name: productName,
        },
      ],
      customer_details: {
        email: customerEmail,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({ token: transaction.token });

  } catch (error: any) {
    console.error("Error creating Midtrans transaction:", error);
    // Berikan pesan error yang lebih spesifik jika memungkinkan
    const errorMessage = error.ApiResponse ? error.ApiResponse.error_messages.join(', ') : error.message || 'Internal server error.';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, amount, productName, productId, customerEmail } = body;

    if (!orderId || !amount || !productName || !productId || !customerEmail) {
      return NextResponse.json({ message: 'Data tidak lengkap.' }, { status: 400 });
    }

    // Inisialisasi Midtrans Snap
    const snap = new midtransClient.Snap({
      isProduction: false, // Set ke true di lingkungan produksi
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
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
    const errorMessage = error.ApiResponse ? error.ApiResponse.error_messages.join(', ') : 'Internal server error.';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

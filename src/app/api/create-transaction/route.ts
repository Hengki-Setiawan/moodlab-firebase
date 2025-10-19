import { NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';

// Variabel lingkungan sekarang dimuat secara otomatis oleh Next.js dari .env.local

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, amount, productName, productId, customerEmail } = body;

    if (!orderId || !amount || !productName || !productId || !customerEmail) {
      return NextResponse.json({ message: 'Data tidak lengkap.' }, { status: 400 });
    }

    // Ambil kunci dari process.env, yang sudah diisi oleh Next.js
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

    if (!serverKey || !clientKey) {
        console.error("Kunci Midtrans tidak ditemukan. Pastikan MIDTRANS_SERVER_KEY dan NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ada di file .env.local");
        throw new Error("Kunci Midtrans tidak dikonfigurasi di environment variables.");
    }


    // Inisialisasi Midtrans Snap
    const snap = new midtransClient.Snap({
      isProduction: true, // Set ke true di lingkungan produksi
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

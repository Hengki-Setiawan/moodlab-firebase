import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { ReceiptEmail } from '@/components/emails/receipt-email';
import type { Product } from '@/lib/types';

// Ambil kunci API Resend dari environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    // Parsing body dari request
    const body = await request.json();
    const { customerEmail, product } = body as { customerEmail: string; product: Product };

    // Validasi data yang masuk
    if (!customerEmail || !product || !product.name || !product.price) {
      return NextResponse.json({ message: 'Data tidak lengkap.' }, { status: 400 });
    }

    // Mengirim email menggunakan Resend
    const { data, error } = await resend.emails.send({
      from: 'Mood Lab Digital <noreply@moodlab.site>', // Ganti dengan domain Anda yang sudah diverifikasi di Resend
      to: [customerEmail],
      subject: `Struk Pembelian Anda untuk ${product.name}`,
      react: ReceiptEmail({ product }),
    });

    // Jika ada error dari Resend
    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ message: 'Gagal mengirim email.', error: error.message }, { status: 500 });
    }

    // Jika berhasil
    return NextResponse.json({ message: 'Email berhasil dikirim!', data });

  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json({ message: 'Internal server error.', error: error.message }, { status: 500 });
  }
}

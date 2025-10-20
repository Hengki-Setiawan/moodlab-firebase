import { NextResponse } from 'next/server';
import { snap } from '@/lib/midtrans';
import type { DigitalProduct } from '@/lib/types';
import type { User } from 'firebase/auth';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
    try {
        const { product, user }: { product: DigitalProduct, user: User } = await request.json();

        if (!product || !user) {
            return NextResponse.json({ error: 'Data produk atau pengguna tidak lengkap' }, { status: 400 });
        }
        
        // Buat ID pesanan unik hanya untuk Midtrans, tanpa menyimpan ke DB dulu
        const orderId = `moodlab-${randomUUID()}`;

        // Siapkan parameter untuk Midtrans
        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: product.price,
            },
            item_details: [{
                id: product.id,
                price: product.price,
                quantity: 1,
                name: product.name,
                category: product.category,
            }],
            customer_details: {
                first_name: user.displayName || user.email?.split('@')[0],
                email: user.email,
                phone: user.phoneNumber,
            },
            callbacks: {
                finish: `${request.headers.get('origin')}/pembayaran/selesai?order_id=${orderId}`,
                error: `${request.headers.get('origin')}/pembayaran/gagal?order_id=${orderId}`,
                pending: `${request.headers.get('origin')}/pembayaran/pending?order_id=${orderId}`
            }
        };

        // Langsung buat transaksi Midtrans
        const transaction = await snap.createTransaction(parameter);

        // Jika Midtrans berhasil, kembalikan responsnya
        if (transaction.token && transaction.redirect_url) {
            return NextResponse.json(transaction);
        } else {
             // Jika Midtrans gagal, lemparkan error
             throw new Error('Gagal membuat token transaksi Midtrans.');
        }

    } catch (error: any) {
        console.error('Error creating transaction:', error);
        
        let errorMessage = 'Terjadi kesalahan pada server saat membuat transaksi.';
        if (error.response && error.response.data) {
             console.error('Midtrans API Error:', error.response.data);
             errorMessage = error.response.data.error_messages ? error.response.data.error_messages.join(', ') : errorMessage;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

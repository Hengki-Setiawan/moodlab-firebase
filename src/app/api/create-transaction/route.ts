import { NextResponse } from 'next/server';
import { coreApi } from '@/lib/midtrans';
import type { DigitalProduct } from '@/lib/types';
import type { User } from 'firebase/auth';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
    try {
        const { product, user }: { product: DigitalProduct, user: User } = await request.json();

        if (!product || !user) {
            return NextResponse.json({ error: 'Data produk atau pengguna tidak lengkap' }, { status: 400 });
        }
        
        const orderId = `moodlab-${randomUUID()}`;

        const parameter = {
            payment_type: 'gopay',
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
                phone: user.phoneNumber || undefined,
            },
            // This part is crucial for some payment methods like GoPay from Core API
            gopay: {
                enable_callback: true,
                callback_url: `https://moodlab.id/pembayaran/notifikasi` // Replace with your actual domain
            }
        };

        // For Core API, we use coreApi.charge()
        const transaction = await coreApi.charge(parameter);

        // Core API response for Gopay doesn't give a redirect_url.
        // It gives `actions` array with a `generate-qr-code` URL.
        // We will send the whole transaction object back to the client.
        // The client will then decide how to display the payment instructions.
        return NextResponse.json(transaction);

    } catch (error: any) {
        console.error('Error creating transaction:', error.message || error);
        
        let errorMessage = 'Terjadi kesalahan pada server saat membuat transaksi.';
        // Handle specific Midtrans error
        if (error.ApiResponse) {
             console.error('Midtrans API Error:', error.ApiResponse);
             errorMessage = error.ApiResponse.status_message || 'Gagal berkomunikasi dengan Midtrans.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

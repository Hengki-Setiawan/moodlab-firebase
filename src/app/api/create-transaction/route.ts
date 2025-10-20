import { NextResponse } from 'next/server';
import { snap } from '@/lib/midtrans';
import type { DigitalProduct, Order } from '@/lib/types';
import { createFirebaseAdminApp } from '@/firebase/server-admin-init';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { User } from 'firebase/auth';

export async function POST(request: Request) {
    try {
        const { product, user }: { product: DigitalProduct, user: User } = await request.json();

        if (!product || !user) {
            return NextResponse.json({ error: 'Data produk atau pengguna tidak lengkap' }, { status: 400 });
        }
        
        const adminApp = createFirebaseAdminApp();
        const firestore = getFirestore(adminApp);
        
        // 1. Generate a unique order ID first
        const orderId = firestore.collection('orders').doc().id;

        // 2. Prepare Midtrans transaction parameter
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

        // 3. Create Midtrans transaction
        const transaction = await snap.createTransaction(parameter);

        // 4. If Midtrans transaction is successful, THEN save the order to Firestore
        if (transaction.token && transaction.redirect_url) {
            const newOrder: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
                userId: user.uid,
                userName: user.displayName || 'N/A',
                userEmail: user.email || 'N/A',
                items: [{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                }],
                totalAmount: product.price,
                status: 'pending',
                paymentGateway: 'midtrans',
                paymentToken: transaction.token,
                paymentRedirectUrl: transaction.redirect_url,
            };

            const orderRef = firestore.collection('orders').doc(orderId);
            await orderRef.set({
                ...newOrder,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            });
        } else {
             // If Midtrans fails, throw an error before attempting to write to DB
             throw new Error('Gagal membuat token transaksi Midtrans.');
        }

        // 5. Return the successful Midtrans response to the client
        return NextResponse.json(transaction);

    } catch (error: any) {
        console.error('Error creating transaction:', error);
        // Log the detailed error on the server
        let errorMessage = 'Terjadi kesalahan pada server saat membuat transaksi.';
        if (error.response && error.response.data) {
             console.error('Midtrans API Error:', error.response.data);
             errorMessage = error.response.data.error_messages ? error.response.data.error_messages.join(', ') : errorMessage;
        }
        
        // Return a generic error to the client to avoid leaking implementation details
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

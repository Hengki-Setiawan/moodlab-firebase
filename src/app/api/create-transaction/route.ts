import { NextResponse } from 'next/server';
import { snap } from '@/lib/midtrans';
import type { DigitalProduct, Order } from '@/lib/types';
import { createFirebaseAdminApp } from '@/firebase/server-admin-init';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import type { User } from 'firebase/auth';

export async function POST(request: Request) {
    try {
        const { product, user }: { product: DigitalProduct, user: User } = await request.json();

        if (!product || !user) {
            return NextResponse.json({ error: 'Data produk atau pengguna tidak lengkap' }, { status: 400 });
        }
        
        // 1. Initialize with Admin SDK for privileged server-side access
        const adminApp = createFirebaseAdminApp();
        const firestore = getFirestore(adminApp);
        const ordersRef = firestore.collection('orders');

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
        };
        
        const orderDocRef = await ordersRef.add({
            ...newOrder,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });
        const orderId = orderDocRef.id;

        // 2. Prepare transaction details for Midtrans
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
                first_name: user.displayName || user.email,
                email: user.email,
                phone: user.phoneNumber,
            },
            callbacks: {
                finish: `${request.headers.get('origin')}/pembayaran/selesai?order_id=${orderId}`,
                error: `${request.headers.get('origin')}/pembayaran/gagal?order_id=${orderId}`,
                pending: `${request.headers.get('origin')}/pembayaran/pending?order_id=${orderId}`
            }
        };

        // 3. Create a Snap transaction
        const transaction = await snap.createTransaction(parameter);
        
        return NextResponse.json(transaction);

    } catch (error: any) {
        console.error('Error creating transaction:', error);
        // Provide a more generic server error message to the client
        return NextResponse.json({ error: 'Terjadi kesalahan pada server saat membuat transaksi.' }, { status: 500 });
    }
}

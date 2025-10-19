import { NextResponse } from 'next/server';
import { snap } from '@/lib/midtrans';
import { createFirebaseAdminApp } from '@/firebase/server-admin-init';
import { getFirestore } from 'firebase-admin/firestore';

export async function POST(request: Request) {
    try {
        const notificationJson = await request.json();
        
        // Use notification handler for security
        const statusResponse = await snap.transaction.notification(notificationJson);
        const orderId = statusResponse.order_id;
        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;

        console.log(`Transaction notification received. Order ID: ${orderId}, Transaction Status: ${transactionStatus}, Fraud Status: ${fraudStatus}`);

        // Initialize with Admin SDK for privileged server-side access
        const adminApp = createFirebaseAdminApp();
        const firestore = getFirestore(adminApp);
        const orderRef = firestore.collection('orders').doc(orderId);

        let newStatus: 'paid' | 'failed' | 'pending' | 'expired' = 'pending';

        if (transactionStatus == 'capture') {
            if (fraudStatus == 'challenge') {
                newStatus = 'pending';
            } else if (fraudStatus == 'accept') {
                newStatus = 'paid';
            }
        } else if (transactionStatus == 'settlement') {
            newStatus = 'paid';
        } else if (transactionStatus == 'cancel' || transactionStatus == 'deny') {
            newStatus = 'failed';
        } else if (transactionStatus == 'expire') {
            newStatus = 'expired';
        } else if (transactionStatus == 'pending') {
            newStatus = 'pending';
        }

        await orderRef.update({
            status: newStatus,
            updatedAt: getFirestore.FieldValue.serverTimestamp(),
            paymentDetails: statusResponse // Optionally save the full response
        });
       
        return NextResponse.json({ message: 'Notification handled' }, { status: 200 });

    } catch (error: any) {
        console.error('Error handling notification:', error);
        // Return a generic error to avoid leaking implementation details
        return NextResponse.json({ error: 'Failed to handle notification.' }, { status: 500 });
    }
}

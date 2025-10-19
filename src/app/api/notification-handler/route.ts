import { NextResponse } from 'next/server';
import { snap } from '@/lib/midtrans';
import { initializeServerSideFirestore } from '@/firebase/server-init';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: Request) {
    try {
        const notificationJson = await request.json();
        
        // Use notification handler for security
        const statusResponse = await snap.transaction.notification(notificationJson);
        const orderId = statusResponse.order_id;
        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;

        console.log(`Transaction notification received. Order ID: ${orderId}, Transaction Status: ${transactionStatus}, Fraud Status: ${fraudStatus}`);

        const { firestore } = initializeServerSideFirestore();
        const orderRef = doc(firestore, 'orders', orderId);

        let newStatus: 'paid' | 'failed' | 'pending' = 'pending';

        if (transactionStatus == 'capture') {
            // For credit card transaction, we need to check fraudStatus
            if (fraudStatus == 'challenge') {
                // TODO set transaction status on your database to 'challenge'
                // and response with 200 OK
                newStatus = 'pending';
            } else if (fraudStatus == 'accept') {
                // TODO set transaction status on your database to 'success'
                // and response with 200 OK
                newStatus = 'paid';
            }
        } else if (transactionStatus == 'settlement') {
            // For other payment methods, settlement means success
            newStatus = 'paid';
        } else if (transactionStatus == 'cancel' ||
                   transactionStatus == 'deny' ||
                   transactionStatus == 'expire') {
            // TODO set transaction status on your database to 'failure'
            // and response with 200 OK
            newStatus = 'failed';
        } else if (transactionStatus == 'pending') {
            // TODO set transaction status on your database to 'pending' / waiting payment
            // and response with 200 OK
            newStatus = 'pending';
        }

        if (newStatus !== 'pending') { // Only update if status changes from initial pending
             await updateDoc(orderRef, {
                status: newStatus,
                updatedAt: serverTimestamp(),
                paymentDetails: statusResponse // Optionally save the full response
            });
        }
       
        return NextResponse.json({ message: 'Notification handled' }, { status: 200 });

    } catch (error: any) {
        console.error('Error handling notification:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { initializeServerSideFirestore } from '@/firebase/server-init';
import midtransclient from 'midtrans-client';
import type { DigitalProduct } from '@/lib/types';

const contactSchema = z.object({
  name: z.string().min(2, 'Nama harus memiliki setidaknya 2 karakter.'),
  email: z.string().email('Alamat email tidak valid.'),
  companyName: z.string().optional(),
  message: z.string().min(10, 'Pesan harus memiliki setidaknya 10 karakter.'),
});

type ContactFormState = {
  errors?: {
    name?: string[];
    email?: string[];
    companyName?: string[];
    message?: string[];
  };
  message?: string;
} | null;

export async function submitContactForm(prevState: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const validatedFields = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    companyName: formData.get('companyName'),
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Error: Silakan periksa kembali isian Anda.',
    };
  }
  
  const { companyName, ...restOfData } = validatedFields.data;

  try {
    const { firestore } = initializeServerSideFirestore();
    const contactSubmissionsRef = collection(firestore, 'contactSubmissions');
    
    await addDoc(contactSubmissionsRef, {
      ...restOfData,
      companyName: companyName || '',
      submissionDate: serverTimestamp(),
    });
    
    revalidatePath('/kontak');

    return {
      message: 'Success: Pesan Anda telah berhasil dikirim!',
    };
  } catch (error) {
    console.error('Error saving to Firestore:', error);
    let errorMessage = 'Gagal menyimpan data Anda. Silakan coba lagi.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return { message: `Error: ${errorMessage}` };
  }
}


type PaymentTokenState = {
  token?: string;
  error?: string;
};

export async function getPaymentToken(product: DigitalProduct): Promise<PaymentTokenState> {
  
  if (!process.env.MIDTRANS_SERVER_KEY) {
    console.error('MIDTRANS_SERVER_KEY is not set');
    return { error: 'Konfigurasi server pembayaran tidak ditemukan.' };
  }

  const snap = new midtransclient.Snap({
    isProduction: false, // Set to true for production
    serverKey: process.env.MIDTRANS_SERVER_KEY,
  });

  const orderId = `PRODUCT-${product.id}-${Date.now()}`;

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
      // For now, we use generic details.
      // In a real app, you'd get this from the logged-in user.
      first_name: "Pembeli",
      last_name: "Produk Digital",
      email: "pembeli@example.com",
      phone: "081234567890"
    }
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    const transactionToken = transaction.token;
    console.log('transactionToken:', transactionToken);
    return { token: transactionToken };
  } catch (e: any) {
    console.error('Error creating Midtrans transaction:', e);
    return { error: `Gagal membuat transaksi: ${e.message}` };
  }
}

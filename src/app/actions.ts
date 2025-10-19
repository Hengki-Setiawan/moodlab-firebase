'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { initializeServerSideFirestore } from '@/firebase/server-init';
import midtransclient from 'midtrans-client';
import type { DigitalProduct } from '@/lib/types';
import { createFirebaseAdminApp } from '@/firebase/server-admin-init';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import { Resend } from 'resend';
import WelcomeEmail from '@/emails/welcome-email';
import PurchaseConfirmationEmail from '@/emails/purchase-confirmation-email';

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

export async function getPaymentToken(product: DigitalProduct, user: {id: string; name: string; email: string;}): Promise<PaymentTokenState> {
  
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
      first_name: user.name,
      email: user.email,
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


// --- AUTH ACTIONS ---

type AuthState = {
  message: string;
  success: boolean;
  errors?: Record<string, string[]>;
} | null;

const loginSchema = z.object({
  email: z.string().email('Alamat email tidak valid.'),
  password: z.string().min(1, 'Kata sandi tidak boleh kosong.'),
});

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  // This is a placeholder. Client-side will handle Firebase login.
  // We return a success message to trigger client-side navigation.
  return { message: 'Login flow initiated.', success: true };
}


const registerSchema = z.object({
  name: z.string().min(2, 'Nama harus memiliki setidaknya 2 karakter.'),
  email: z.string().email('Alamat email tidak valid.'),
  password: z.string().min(6, 'Kata sandi harus memiliki setidaknya 6 karakter.'),
});

export async function register(prevState: AuthState, formData: FormData): Promise<AuthState> {
   // This is a placeholder. Client-side will handle Firebase registration.
   // We return a success message to trigger client-side actions.
  return { message: 'Registration flow initiated.', success: true };
}

export async function createSession(idToken: string) {
  // We only want to create a session cookie if the app is running in a production environment.
  // In a local dev environment, the Firebase Admin SDK will not be initialized and will throw an error.
  if (process.env.NODE_ENV !== 'production') {
    console.log('Skipping session creation in development environment.');
    return;
  }
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
  const app = createFirebaseAdminApp();
  const auth = getAuth(app);
  const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
  cookies().set('__session', sessionCookie, { maxAge: expiresIn, httpOnly: true, secure: true });
}

export async function clearSession() {
  cookies().delete('__session');
}

// --- EMAIL ACTIONS ---

const fromEmail = process.env.EMAIL_FROM_ADDRESS || 'Mood Lab <noreply@moodlab.id>';

let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.warn("RESEND_API_KEY is not set. Email sending will be disabled. Please create a .env.local file and add your Resend API key.");
}


export async function sendWelcomeEmail(name: string, email: string) {
  if (!resend) {
    console.log(`Skipping welcome email to ${email} because email sending is disabled.`);
    return { success: false, message: 'Email sending is disabled on the server.' };
  }
  try {
    await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: 'Selamat Datang di Mood Lab!',
      react: WelcomeEmail({ userName: name }),
    });
    console.log(`Welcome email sent to ${email}`);
    return { success: true, message: 'Welcome email sent.' };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, message: 'Failed to send welcome email.' };
  }
}

export async function sendPurchaseConfirmationEmail(userName: string, userEmail: string, product: DigitalProduct, orderId: string) {
   if (!resend) {
    console.log(`Skipping purchase confirmation email to ${userEmail} because email sending is disabled.`);
    return { success: false, message: 'Email sending is disabled on the server.' };
  }
  try {
    await resend.emails.send({
      from: fromEmail,
      to: [userEmail],
      subject: `Konfirmasi Pembelian Anda: ${product.name}`,
      react: PurchaseConfirmationEmail({ 
        userName,
        product,
        orderId
      }),
    });
    console.log(`Purchase confirmation email sent to ${userEmail}`);
    return { success: true, message: 'Purchase confirmation email sent.' };
  } catch (error) {
    console.error('Error sending purchase confirmation email:', error);
    return { success: false, message: 'Failed to send purchase confirmation email.' };
  }
}

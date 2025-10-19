'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { initializeServerSideFirestore } from '@/firebase/server-init';
import { createFirebaseAdminApp } from '@/firebase/server-admin-init';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import { Resend } from 'resend';
import { WelcomeEmail } from '@/emails/welcome-email';

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
const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.EMAIL_FROM_ADDRESS || 'Mood Lab <onboarding@resend.dev>';

export async function sendWelcomeEmail(name: string, email: string) {
  if (!resendApiKey) {
    console.warn("RESEND_API_KEY is not set. Skipping welcome email.");
    return;
  }
  const resend = new Resend(resendApiKey);
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Selamat Datang di Mood Lab!',
      react: WelcomeEmail({ userName: name }),
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
}

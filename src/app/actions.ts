'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { initializeServerSideFirestore } from '@/firebase/server-init';

const contactSchema = z.object({
  name: z.string().min(2, 'Nama harus memiliki setidaknya 2 karakter.'),
  email: z.string().email('Alamat email tidak valid.'),
  companyName: z.string().optional(),
  message: z.string().min(10, 'Pesan harus memiliki setidaknya 10 karakter.'),
});

type State = {
  errors?: {
    name?: string[];
    email?: string[];
    companyName?: string[];
    message?: string[];
  };
  message?: string;
};

export async function submitContactForm(prevState: State, formData: FormData): Promise<State> {
  const validatedFields = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    companyName: formData.get('company'), // Pastikan ini 'companyName'
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Error: Silakan periksa kembali isian Anda.',
    };
  }
  
  // Destructure companyName dari data yang divalidasi
  const { companyName, ...restOfData } = validatedFields.data;

  try {
    const { firestore } = initializeServerSideFirestore();
    const contactSubmissionsRef = collection(firestore, 'contactSubmissions');
    
    await addDoc(contactSubmissionsRef, {
      ...restOfData,
      companyName: companyName || '', // Pastikan companyName ada
      submissionDate: serverTimestamp(),
    });
    
    console.log('Contact form submitted and saved to Firestore:', validatedFields.data);

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

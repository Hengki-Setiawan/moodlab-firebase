'use server';

import { z } from 'zod';
import { initializeServerSideFirebase } from '@/firebase/server-init';
import { revalidatePath } from 'next/cache';
import { push, serverTimestamp, set } from 'firebase/database';

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
    company: formData.get('company'),
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Error: Silakan periksa kembali isian Anda.',
    };
  }

  try {
    const { db } = initializeServerSideFirebase();
    const contactSubmissionsRef = ref(db, 'contactSubmissions');
    const newSubmissionRef = push(contactSubmissionsRef);

    await set(newSubmissionRef, {
      ...validatedFields.data,
      submissionDate: serverTimestamp(),
    });
    
    console.log('Contact form submitted and saved to Realtime Database:', validatedFields.data);

    revalidatePath('/kontak');

    return {
      message: 'Success: Pesan Anda telah berhasil dikirim!',
    };
  } catch (error) {
    console.error('Error saving to Realtime Database:', error);
    let errorMessage = 'Gagal menyimpan data Anda. Silakan coba lagi.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return { message: `Error: ${errorMessage}` };
  }
}

// Action to seed the database
import { seedProducts as seedDbProducts } from '@/lib/seed-db';
import { ref } from 'firebase/database';

export async function seedDatabase() {
    console.log("Seeding database...");
    const result = await seedDbProducts();
    
    // Revalidate the path to show the new products
    if (result.success) {
        revalidatePath('/produk');
    }

    return result;
}

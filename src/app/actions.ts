'use server';

import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, 'Nama harus memiliki setidaknya 2 karakter.'),
  email: z.string().email('Alamat email tidak valid.'),
  company: z.string().optional(),
  message: z.string().min(10, 'Pesan harus memiliki setidaknya 10 karakter.'),
});

type State = {
  errors?: {
    name?: string[];
    email?: string[];
    company?: string[];
    message?: string[];
  };
  message?: string;
};

export async function submitContactForm(prevState: State, formData: FormData): Promise<State> {
  // Artificial delay to simulate network
  await new Promise(resolve => setTimeout(resolve, 1000));
  
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

  // In a real application, you would save this data to a database like Firestore
  // and trigger a cloud function for email notifications.
  // Example:
  // try {
  //   const { getFirestore } = require('firebase-admin/firestore');
  //   const db = getFirestore();
  //   await db.collection('contactSubmissions').add({
  //     ...validatedFields.data,
  //     submittedAt: new Date(),
  //   });
  // } catch (error) {
  //   return { message: 'Error: Database operation failed.' };
  // }
  
  console.log('Contact form submitted:', validatedFields.data);

  return {
    message: 'Success: Pesan Anda telah berhasil dikirim!',
  };
}

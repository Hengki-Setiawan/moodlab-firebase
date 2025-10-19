'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { register, createSession, sendWelcomeEmail } from '../actions';
import { useAuth } from '@/firebase';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Nama harus memiliki setidaknya 2 karakter.' }),
  email: z.string().email({ message: 'Alamat email tidak valid.' }),
  password: z.string().min(6, { message: 'Kata sandi harus memiliki setidaknya 6 karakter.' }),
});

type FormValues = z.infer<typeof formSchema>;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Mendaftarkan...' : 'Daftar'}
    </Button>
  );
}

export function RegisterForm() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [state, formAction] = useActionState(register, null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      await updateProfile(userCredential.user, {
        displayName: data.name
      });
      
      const idToken = await userCredential.user.getIdToken();
      await createSession(idToken);
      
      // Send welcome email in the background
      sendWelcomeEmail(data.name, data.email);
      
      toast({
        title: 'Pendaftaran Berhasil!',
        description: 'Akun Anda telah berhasil dibuat. Email selamat datang telah dikirim.',
      });
      router.push('/');

    } catch (error: any) {
      console.error('Registration error:', error);
      let description = 'Terjadi kesalahan. Silakan coba lagi.';
      if (error.code === 'auth/email-already-in-use') {
        description = 'Alamat email ini sudah terdaftar.';
      }
      toast({
        title: 'Pendaftaran Gagal',
        description: description,
        variant: 'destructive',
      });
    }
  };
  
  useEffect(() => {
    if (state?.errors) {
      const { errors } = state;
      if (errors.name) form.setError('name', { type: 'server', message: errors.name[0] });
      if (errors.email) form.setError('email', { type: 'server', message: errors.email[0] });
      if (errors.password) form.setError('password', { type: 'server', message: errors.password[0] });
    }
  }, [state, form]);


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Lengkap</FormLabel>
              <FormControl>
                <Input placeholder="Nama Anda" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@anda.com" {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kata Sandi</FormLabel>
              <FormControl>
                <Input placeholder="••••••••" {...field} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <SubmitButton />
      </form>
    </Form>
  );
}

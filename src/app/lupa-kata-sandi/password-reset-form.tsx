'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useTransition } from 'react';

const formSchema = z.object({
  email: z.string().email({ message: 'Alamat email tidak valid.' }),
});

type FormValues = z.infer<typeof formSchema>;

export function PasswordResetForm() {
  const auth = useAuth();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      try {
        await sendPasswordResetEmail(auth, data.email);
        toast({
          title: 'Email Terkirim',
          description: 'Link untuk mereset kata sandi telah dikirim ke email Anda.',
        });
        form.reset();
      } catch (error: any) {
        console.error('Password reset error:', error);
        toast({
          title: 'Gagal Mengirim Email',
          description: 'Pastikan email yang Anda masukkan benar dan coba lagi.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? 'Mengirim...' : 'Kirim Link Reset'}
        </Button>
      </form>
    </Form>
  );
}

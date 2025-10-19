'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { submitContactForm } from '../actions';
import { ArrowRight } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Nama harus memiliki setidaknya 2 karakter.' }),
  email: z.string().email({ message: 'Alamat email tidak valid.' }),
  companyName: z.string().optional(),
  message: z.string().min(10, { message: 'Pesan harus memiliki setidaknya 10 karakter.' }),
});

type FormValues = z.infer<typeof formSchema>;

const initialState = {
  message: '',
  errors: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} size="lg" className="w-full sm:w-auto bg-gradient-to-r from-gradient-blue via-gradient-purple to-gradient-pink text-primary-foreground hover:opacity-90 transition-opacity">
      {pending ? 'Mengirim...' : 'Kirim Pesan'}
      {!pending && <ArrowRight className="ml-2 h-5 w-5" />}
    </Button>
  );
}

export function ContactForm() {
  const { toast } = useToast();
  const [state, formAction] = useActionState(submitContactForm, initialState);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      companyName: '',
      message: '',
    },
  });

  useEffect(() => {
    if (state.message) {
      if (state.message.startsWith('Success')) {
        toast({
          title: "Pesan Terkirim!",
          description: "Terima kasih telah menghubungi kami. Tim kami akan segera merespons.",
        });
        form.reset();
      } else if (state.message.startsWith('Error')) {
        toast({
          title: "Gagal Mengirim",
          description: state.message,
          variant: 'destructive',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Handle server-side validation errors
  useEffect(() => {
    const errors = state.errors;
    if (errors) {
      if (errors.name) form.setError('name', { type: 'server', message: errors.name[0] });
      if (errors.email) form.setError('email', { type: 'server', message: errors.email[0] });
      if (errors.companyName) form.setError('companyName', { type: 'server', message: errors.companyName[0] });
      if (errors.message) form.setError('message', { type: 'server', message: errors.message[0] });
    }
  }, [state.errors, form]);


  return (
    <Form {...form}>
      <form action={formAction} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama</FormLabel>
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
                <Input placeholder="email@anda.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Perusahaan/UMKM (Opsional)</FormLabel>
              <FormControl>
                <Input placeholder="Nama bisnis Anda" {...field} name="companyName" value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pesan</FormLabel>
              <FormControl>
                <Textarea placeholder="Ceritakan tentang proyek atau ide Anda..." {...field} rows={5} />
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

import { RegisterForm } from './register-form';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <section className="py-16 md:py-24 bg-secondary">
      <div className="container flex items-center justify-center min-h-[calc(100vh-20rem)]">
        <div className="w-full max-w-md p-8 space-y-8 bg-background rounded-2xl shadow-lg">
          <div className="text-center">
            <h1 className="font-headline text-3xl md:text-4xl font-bold">Buat Akun Baru</h1>
            <p className="text-muted-foreground mt-2">
              Daftar sekarang untuk memulai.
            </p>
          </div>
          <RegisterForm />
          <p className="text-center text-sm text-muted-foreground">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

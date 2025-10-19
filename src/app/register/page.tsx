import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RegisterForm } from './register-form';

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold font-headline">Buat Akun</CardTitle>
            <CardDescription>
              Daftar untuk mulai berbelanja produk digital kami.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Sudah punya akun?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Login di sini
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

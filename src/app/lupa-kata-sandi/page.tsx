import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PasswordResetForm } from './password-reset-form';

export default function ForgotPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold font-headline">Lupa Kata Sandi</CardTitle>
            <CardDescription>
              Masukkan email Anda dan kami akan mengirimkan link untuk mereset kata sandi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordResetForm />
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Ingat kata sandi Anda?{' '}
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

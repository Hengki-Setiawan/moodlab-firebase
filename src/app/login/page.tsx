import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold font-headline">Login</CardTitle>
            <CardDescription>
              Masuk ke akun Anda untuk melanjutkan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Belum punya akun?{' '}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Daftar di sini
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

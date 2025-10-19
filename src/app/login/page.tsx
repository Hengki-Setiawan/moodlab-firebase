import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <section className="py-16 md:py-24">
      <div className="container flex justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-headline text-4xl font-bold">Login atau Daftar</h1>
            <p className="text-muted-foreground mt-2">
              Akses akun Anda untuk melanjutkan.
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </section>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

function UserSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-10 w-24 mt-4" />
        </div>
    )
}

export default function AccountPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Jika loading selesai dan tidak ada user, redirect ke halaman login
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Logout Berhasil',
        description: 'Anda telah berhasil keluar.',
      });
      router.push('/'); // Redirect ke homepage setelah logout
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: 'Gagal Logout',
        description: 'Terjadi kesalahan saat mencoba keluar.',
        variant: 'destructive',
      });
    }
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Akun Saya</CardTitle>
            <CardDescription>Informasi akun Anda.</CardDescription>
          </CardHeader>
          <CardContent>
            {isUserLoading ? (
                <UserSkeleton />
            ) : user ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">Email</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">User ID</h3>
                  <p className="text-muted-foreground text-sm break-all">{user.uid}</p>
                </div>
                <Button onClick={handleLogout} variant="destructive" className="mt-4">
                  Logout
                </Button>
              </div>
            ) : (
                <p>Tidak ada informasi pengguna. Anda akan diarahkan...</p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

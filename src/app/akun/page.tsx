'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { signOut, sendEmailVerification } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

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
  const [isSendingVerification, setIsSendingVerification] = useState(false);

  useEffect(() => {
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
      router.push('/');
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: 'Gagal Logout',
        description: 'Terjadi kesalahan saat mencoba keluar.',
        variant: 'destructive',
      });
    }
  };
  
  const handleResendVerification = async () => {
    if (!user) return;
    setIsSendingVerification(true);
    try {
      await sendEmailVerification(user);
      toast({
        title: 'Email Verifikasi Terkirim',
        description: 'Silakan periksa kotak masuk email Anda.',
      });
    } catch (error) {
      console.error("Resend verification error:", error);
      toast({
        title: 'Gagal Mengirim Email',
        description: 'Terjadi kesalahan. Silakan coba lagi nanti.',
        variant: 'destructive',
      });
    } finally {
        setIsSendingVerification(false);
    }
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Akun Saya</CardTitle>
            <CardDescription>Informasi akun dan status verifikasi Anda.</CardDescription>
          </CardHeader>
          <CardContent>
            {isUserLoading ? (
                <UserSkeleton />
            ) : user ? (
              <div className="space-y-6">
                
                {user.emailVerified ? (
                    <Alert variant="default" className="border-green-500 bg-green-50 text-green-800">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertTitle>Email Terverifikasi</AlertTitle>
                        <AlertDescription>
                            Akun Anda telah terverifikasi dan aktif sepenuhnya.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <Alert variant="destructive" className="border-yellow-500 bg-yellow-50 text-yellow-800">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertTitle>Verifikasi Email Diperlukan</AlertTitle>
                        <AlertDescription className='flex flex-col gap-4'>
                            <span>Email Anda belum terverifikasi. Silakan periksa kotak masuk Anda atau kirim ulang email verifikasi.</span>
                            <Button 
                                onClick={handleResendVerification} 
                                disabled={isSendingVerification}
                                size="sm"
                                className="w-fit bg-yellow-600 hover:bg-yellow-700 text-white"
                            >
                                {isSendingVerification ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Mengirim...
                                    </>
                                ) : (
                                    'Kirim Ulang Verifikasi'
                                )}
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                <div className="space-y-4">
                    <div>
                    <h3 className="font-semibold text-lg">Email</h3>
                    <p className="text-muted-foreground">{user.email}</p>
                    </div>
                    <div>
                    <h3 className="font-semibold text-lg">User ID</h3>
                    <p className="text-muted-foreground text-sm break-all">{user.uid}</p>
                    </div>
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

"use client";

import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { signOut, sendEmailVerification } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { clearSession } from '../actions';

function AccountSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-full" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-full" />
                </div>
                <Skeleton className="h-10 w-32 mt-4" />
            </CardContent>
        </Card>
    )
}

function VerificationBanner({ user, onResend, isSending }: { user: any, onResend: () => void, isSending: boolean }) {
    if (user.emailVerified) {
        return null;
    }

    return (
        <Alert variant="destructive" className="mb-6">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Email Belum Diverifikasi!</AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <span>Periksa kotak masuk Anda untuk link verifikasi.</span>
                <Button 
                    onClick={onResend} 
                    disabled={isSending}
                    variant="outline" 
                    size="sm" 
                    className="mt-2 sm:mt-0 sm:ml-4 bg-destructive-foreground text-destructive hover:bg-destructive-foreground/90"
                >
                    {isSending ? 'Mengirim...' : 'Kirim Ulang Email'}
                </Button>
            </AlertDescription>
        </Alert>
    );
}


export function AccountDetails() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [isSendingVerification, setIsSendingVerification] = useState(false);

  useEffect(() => {
    // If loading is finished and there's no user, redirect to login
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await clearSession();
      router.push('/'); 
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleResendVerificationEmail = async () => {
    if (!user) return;
    setIsSendingVerification(true);
    try {
        await sendEmailVerification(user);
        toast({
            title: "Email Verifikasi Terkirim!",
            description: "Silakan periksa kotak masuk email Anda.",
        });
    } catch (error: any) {
        console.error("Error resending verification email:", error);
        toast({
            title: "Gagal Mengirim Email",
            description: error.message || "Terjadi kesalahan saat mengirim email verifikasi.",
            variant: "destructive",
        });
    } finally {
        setIsSendingVerification(false);
    }
  };


  if (isUserLoading || !user) {
    return <AccountSkeleton />;
  }

  return (
    <>
      <VerificationBanner 
        user={user} 
        onResend={handleResendVerificationEmail} 
        isSending={isSendingVerification}
      />
      <Card>
        <CardHeader>
          <CardTitle>Detail Profil</CardTitle>
          <CardDescription>Informasi ini bersifat pribadi dan tidak akan ditampilkan secara publik.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Nama Lengkap</p>
            <p className="text-lg font-semibold">{user.displayName || 'Nama belum diatur'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Alamat Email</p>
            <div className="flex items-center gap-2">
                <p className="text-lg font-semibold">{user.email}</p>
                <span className={`px-2 py-0.5 text-xs rounded-full ${user.emailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {user.emailVerified ? 'Terverifikasi' : 'Belum Terverifikasi'}
                </span>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline">
              Logout
          </Button>
        </CardContent>
      </Card>
    </>
  );
}

    
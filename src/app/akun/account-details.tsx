"use client";

import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';

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


export function AccountDetails() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    // If loading is finished and there's no user, redirect to login
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/'); 
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };


  if (isUserLoading || !user) {
    // Show skeleton or a loading spinner while checking auth state
    // or before the redirect happens.
    return <AccountSkeleton />;
  }

  return (
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
          <p className="text-lg font-semibold">{user.email}</p>
        </div>
         <Button onClick={handleLogout} variant="outline">
            Logout
        </Button>
      </CardContent>
    </Card>
  );
}

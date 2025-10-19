'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth, useFirestore, useCollection, useMemoFirebase, useFirebaseApp } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { signOut, sendEmailVerification } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react';
import { collection, query, orderBy } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';

type Transaction = {
    orderId: string;
    productName: string;
    amount: number;
    transactionTime: string;
    status: 'success' | 'pending' | 'failure';
};

function UserSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-10 w-24 mt-4" />
        </div>
    )
}

function TransactionHistory() {
    const { user } = useUser();
    const firestore = useFirestore();

    const transactionsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, `users/${user.uid}/transactions`), orderBy('transactionTime', 'desc'));
    }, [user, firestore]);

    const { data: transactions, isLoading } = useCollection<Transaction>(transactionsQuery);

    const getStatusVariant = (status: Transaction['status']) => {
        switch (status) {
            case 'success': return 'default';
            case 'pending': return 'secondary';
            case 'failure': return 'destructive';
            default: return 'outline';
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-2 mt-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }
    
    if (!transactions || transactions.length === 0) {
        return <p className="text-sm text-muted-foreground mt-4">Anda belum memiliki riwayat transaksi.</p>
    }

    return (
        <div className="border rounded-md mt-6">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Produk</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((tx) => (
                        <TableRow key={tx.id}>
                            <TableCell className="font-medium">{tx.productName}</TableCell>
                            <TableCell>{new Date(tx.transactionTime).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric'})}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusVariant(tx.status)}>{tx.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(tx.amount)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}


export default function AccountPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firebaseApp = useFirebaseApp();
  const router = useRouter();
  const { toast } = useToast();
  const [isSendingVerification, setIsSendingVerification] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    if (!auth) return;
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
        let description = 'Terjadi kesalahan. Silakan coba lagi nanti.';
        if (error instanceof FirebaseError && error.code === 'auth/too-many-requests') {
            description = 'Terlalu banyak permintaan. Silakan tunggu beberapa saat sebelum mencoba lagi.';
        }
        toast({
            title: 'Gagal Mengirim Email',
            description,
            variant: 'destructive',
        });
    } finally {
        setIsSendingVerification(false);
    }
  };

  const projectId = firebaseApp?.options.projectId;

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="max-w-4xl mx-auto space-y-8">
            <Card>
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
                </div>
                ) : (
                    <p>Tidak ada informasi pengguna. Anda akan diarahkan...</p>
                )}
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-6">
                 { user && <Button onClick={handleLogout} variant="destructive">Logout</Button> }

                 { projectId && (
                    <Alert variant="default" className='border-blue-500 text-blue-800 bg-blue-50'>
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertTitle>Info Diagnostik</AlertTitle>
                        <AlertDescription>
                            <p>Aplikasi ini terhubung ke Project ID Firebase:</p>
                            <p className="font-mono text-sm mt-1 bg-blue-100 p-2 rounded break-all">{projectId}</p>
                            <p className='mt-2'>Pastikan Project ID ini sama dengan yang Anda lihat di URL konsol Firebase Anda.</p>
                        </AlertDescription>
                    </Alert>
                 )}
            </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Riwayat Transaksi</CardTitle>
                    <CardDescription>Daftar semua pembelian yang telah Anda lakukan.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isUserLoading ? (
                        <div className="space-y-2 mt-4">
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : user ? (
                        <TransactionHistory />
                    ) : (
                        <p className="text-sm text-muted-foreground">Silakan login untuk melihat riwayat transaksi Anda.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </section>
  );
}

    
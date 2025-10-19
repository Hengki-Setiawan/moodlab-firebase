'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

function OrderHistorySkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex justify-between items-center">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <Skeleton className="h-6 w-20" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function OrderHistoryList() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const ordersQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, 'orders'), 
            where('userId', '==', user.uid),
            orderBy('purchaseDate', 'desc')
        );
    }, [firestore, user]);

    const { data: orders, isLoading, error } = useCollection<Order>(ordersQuery);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '-';
        // Convert Firestore Timestamp to JavaScript Date
        const date = timestamp.toDate();
        return format(date, 'dd MMMM yyyy, HH:mm', { locale: id });
    };

    if (isUserLoading || (isLoading && !orders)) {
        return <OrderHistorySkeleton />;
    }

    if (error) {
        return <p className="text-destructive">Error: {error.message}</p>;
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Riwayat Pembelian</CardTitle>
            </CardHeader>
            <CardContent>
                {orders && orders.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal Pembelian</TableHead>
                                <TableHead>Nama Produk</TableHead>
                                <TableHead className="text-right">Harga</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell>{formatDate(order.purchaseDate)}</TableCell>
                                    <TableCell className="font-medium">{order.productName}</TableCell>
                                    <TableCell className="text-right">{formatPrice(order.price)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Anda belum memiliki riwayat pesanan.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}


export default function OrderHistoryPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    
    useEffect(() => {
        if (!isUserLoading && !user) {
          router.replace('/login');
        }
    }, [user, isUserLoading, router]);

    if (isUserLoading || !user) {
        return (
            <div className="container py-12 md:py-16">
                 <div className="max-w-4xl mx-auto">
                    <OrderHistorySkeleton />
                 </div>
            </div>
        )
    }

    return (
        <div className="container py-12 md:py-16">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold">Riwayat Pesanan</h1>
                    <p className="mt-2 text-lg text-muted-foreground">
                        Lihat semua transaksi produk digital yang pernah Anda beli.
                    </p>
                </div>
                <OrderHistoryList />
            </div>
        </div>
    );
}
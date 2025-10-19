'use client';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, type CollectionReference } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

function OrderSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-1" />
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-6 w-20" />
                </div>
            </CardContent>
        </Card>
    )
}

const statusMap: { [key: string]: { text: string; variant: "default" | "secondary" | "destructive" | "outline" } } = {
    paid: { text: 'Berhasil', variant: 'default' },
    pending: { text: 'Pending', variant: 'secondary' },
    failed: { text: 'Gagal', variant: 'destructive' },
    expired: { text: 'Kadaluarsa', variant: 'destructive' },
};

export default function OrderHistoryPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const ordersQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        const ordersCollection = collection(firestore, 'orders') as CollectionReference<Order>;
        return query(ordersCollection, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
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
        if (!timestamp) return 'Tanggal tidak valid';
        // Firestore timestamps can be either Firebase Timestamps or server-generated string representations
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return format(date, "d MMMM yyyy, HH:mm", { locale: id });
    };

    if (isUserLoading || isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => <OrderSkeleton key={i} />)}
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-12 border rounded-lg bg-destructive/10 border-destructive">
                <h3 className="text-xl font-semibold text-destructive-foreground">Gagal memuat riwayat pesanan</h3>
                <p className="text-muted-foreground mt-2">{error.message}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
             <div className="mb-8">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Riwayat Pesanan</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Lacak semua transaksi Anda di sini.
                </p>
            </div>
            {orders && orders.length > 0 ? (
                orders.map((order) => (
                    <Card key={order.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">Pesanan #{order.id.substring(0, 8)}</CardTitle>
                                    <CardDescription>{formatDate(order.createdAt)}</CardDescription>
                                </div>
                                <Badge variant={statusMap[order.status]?.variant || 'secondary'}>
                                    {statusMap[order.status]?.text || 'Tidak Diketahui'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                           {order.items.map(item => (
                               <div key={item.id} className="flex justify-between items-center py-2">
                                   <div>
                                       <p className="font-semibold">{item.name}</p>
                                       <p className="text-sm text-muted-foreground">{item.quantity} x {formatPrice(item.price)}</p>
                                   </div>
                                    <p className="font-semibold">{formatPrice(item.quantity * item.price)}</p>
                               </div>
                           ))}
                           <Separator className="my-2"/>
                            <div className="flex justify-between items-center font-bold mt-2">
                                <p>Total</p>
                                <p>{formatPrice(order.totalAmount)}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <h3 className="text-xl font-semibold">Anda belum memiliki pesanan.</h3>
                    <p className="text-muted-foreground mt-2">Mulai belanja sekarang untuk melihat riwayat pesanan Anda di sini.</p>
                    <Button asChild className="mt-4">
                        <Link href="/produk">Jelajahi Produk</Link>
                    </Button>
                </div>
            )}
        </div>
    )
}

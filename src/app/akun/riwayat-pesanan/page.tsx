"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, type CollectionReference } from "firebase/firestore";
import type { Order } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function OrderHistorySkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-16" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(3)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-9 w-16" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

function EmptyHistory() {
    return (
         <div className="text-center py-24 border rounded-lg">
            <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
            <h2 className="mt-6 text-2xl font-bold">Anda Belum Punya Pesanan</h2>
            <p className="mt-2 text-muted-foreground">Semua pesanan yang Anda buat akan muncul di sini.</p>
            <Button asChild className="mt-6">
                <Link href="/produk">Mulai Belanja</Link>
            </Button>
        </div>
    )
}


export default function RiwayatPesananPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.replace('/login?redirect=/akun/riwayat-pesanan');
        }
    }, [user, isUserLoading, router]);

    const ordersQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, 'orders') as CollectionReference<Order>,
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );
    }, [firestore, user]);

    const { data: orders, isLoading, error } = useCollection<Order>(ordersQuery);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp.seconds * 1000).toLocaleDateString('id-ID', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const getStatusBadgeVariant = (status: Order['status']) => {
        switch (status) {
            case 'processed': return 'default';
            case 'shipped': return 'secondary';
            case 'completed': return 'default'; // Success color would be good
            case 'pending': return 'outline';
            case 'cancelled': return 'destructive';
            default: return 'secondary';
        }
    }
     const getStatusText = (status: Order['status']) => {
        switch (status) {
            case 'pending': return 'Menunggu Pembayaran';
            case 'processed': return 'Diproses';
            case 'shipped': return 'Dikirim';
            case 'completed': return 'Selesai';
            case 'cancelled': return 'Dibatalkan';
            default: return status;
        }
    }

    if (isUserLoading || (isLoading && !orders)) {
        return <OrderHistorySkeleton />;
    }

    if (!user) {
        // This will be handled by the useEffect redirect, but as a fallback:
        return (
            <div className="text-center py-24">
                <p>Silakan login untuk melihat riwayat pesanan.</p>
            </div>
        );
    }
    
    if (error) {
        return <div className="text-destructive">Error: {error.message}</div>
    }

    if (!isLoading && orders && orders.length === 0) {
        return <EmptyHistory />;
    }

    return (
        <div className="space-y-8">
            <div className="mb-8">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Riwayat Pesanan</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Lihat semua transaksi yang pernah Anda lakukan.
                </p>
            </div>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID Pesanan</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead><span className="sr-only">Aksi</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders?.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-mono text-sm text-muted-foreground hidden sm:table-cell">#{order.id.substring(0,7)}...</TableCell>
                                    <TableCell className="font-mono text-sm text-muted-foreground sm:hidden">#{order.id.substring(0,7)}</TableCell>
                                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                                    <TableCell>{formatPrice(order.totalAmount)}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(order.status)}>{getStatusText(order.status)}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href={`/akun/riwayat-pesanan/${order.id}`}>
                                                Lihat Detail
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

    
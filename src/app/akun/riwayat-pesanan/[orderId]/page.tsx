"use client";

import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, type DocumentReference } from "firebase/firestore";
import type { Order } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

function OrderDetailsSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <Skeleton className="h-16 w-16 rounded" />
                                <div className="flex-grow space-y-2">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                                <Skeleton className="h-5 w-1/4" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-2/3" />
                </CardContent>
             </Card>
        </div>
    );
}

export default function OrderDetailPage({ params }: { params: { orderId: string } }) {
    const { orderId } = params;
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

     useEffect(() => {
        if (!isUserLoading && !user) {
            router.replace(`/login?redirect=/akun/riwayat-pesanan/${orderId}`);
        }
    }, [user, isUserLoading, router, orderId]);

    const orderRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'orders', orderId) as DocumentReference<Order>;
    }, [firestore, orderId]);

    const { data: order, isLoading, error } = useDoc<Order>(orderRef);

    // Security check: If the loaded order does not belong to the current user, redirect.
    useEffect(() => {
        if (!isLoading && order && user && order.userId !== user.uid) {
            toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk melihat pesanan ini.", variant: "destructive" });
            router.replace('/akun/riwayat-pesanan');
        }
    }, [order, user, isLoading, router]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp.seconds * 1000).toLocaleString('id-ID', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
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
    
    if (isLoading || isUserLoading) {
        return <OrderDetailsSkeleton />;
    }
    
    if (error) {
        return <div className="text-destructive text-center py-12">Error: {error.message}</div>
    }

    if (!order) {
        return <div className="text-center py-12">Pesanan tidak ditemukan.</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Detail Pesanan</h1>
                <p className="text-muted-foreground mt-1">ID Pesanan: <span className="font-mono">#{order.id}</span></p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Ringkasan</CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-3 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Tanggal Pesanan</p>
                        <p className="font-medium">{formatDate(order.createdAt)}</p>
                    </div>
                     <div>
                        <p className="text-muted-foreground">Total Pesanan</p>
                        <p className="font-medium">{formatPrice(order.totalAmount)}</p>
                    </div>
                     <div>
                        <p className="text-muted-foreground">Status</p>
                        <Badge variant={getStatusBadgeVariant(order.status)}>{getStatusText(order.status)}</Badge>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Item yang Dipesan</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Produk</TableHead>
                                <TableHead className="text-center">Jumlah</TableHead>
                                <TableHead className="text-right">Harga Satuan</TableHead>
                                <TableHead className="text-right">Subtotal</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {order.items.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="rounded object-cover" />
                                            <span className="font-medium">{item.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">{item.quantity}</TableCell>
                                    <TableCell className="text-right">{formatPrice(item.price)}</TableCell>
                                    <TableCell className="text-right font-medium">{formatPrice(item.price * item.quantity)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                 <CardFooter className="flex justify-end bg-secondary/50 p-6">
                    <div className="w-full max-w-xs space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>{formatPrice(order.totalAmount)}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Ongkos Kirim</span>
                            <span>{formatPrice(0)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>{formatPrice(order.totalAmount)}</span>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}

    
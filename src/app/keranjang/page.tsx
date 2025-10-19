"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Trash2, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { createOrder, getPaymentToken, handleSuccessfulPayment } from "@/app/actions";
import { useState, useEffect, useTransition } from "react";
import type { Order } from "@/lib/types";

declare global {
  interface Window {
    snap: any;
  }
}

function EmptyCart() {
    return (
        <div className="text-center py-24">
            <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
            <h2 className="mt-6 text-2xl font-bold">Keranjang Anda Kosong</h2>
            <p className="mt-2 text-muted-foreground">Sepertinya Anda belum menambahkan produk apapun.</p>
            <Button asChild className="mt-6">
                <Link href="/produk">Mulai Belanja</Link>
            </Button>
        </div>
    )
}

export default function KeranjangPage() {
    const { items, removeItem, updateItemQuantity, totalPrice, totalItems, clearCart } = useCart();
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

     useEffect(() => {
        const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
        if (!clientKey) {
            console.error("Midtrans client key is not set.");
            return;
        }
        
        const scriptId = 'midtrans-snap-script';
        let script = document.getElementById(scriptId) as HTMLScriptElement | null;

        if (!script) {
            script = document.createElement('script');
            script.id = scriptId;
            script.src = "https://app.sandbox.midtrans.com/snap/snap.js"; // Use sandbox for development
            script.setAttribute('data-client-key', clientKey);
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
    };

    const handleCheckout = () => {
        if (!user) {
            toast({ title: "Anda Belum Login", description: "Silakan login untuk melanjutkan pembayaran.", variant: "destructive" });
            router.push('/login?redirect=/keranjang');
            return;
        }

        startTransition(async () => {
            const orderState = await createOrder(items, totalPrice, user.uid);

            if (orderState.error || !orderState.orderId) {
                toast({ title: "Gagal Membuat Pesanan", description: orderState.error, variant: "destructive" });
                return;
            }

            const orderId = orderState.orderId;
            const orderDetails: Order = {
                id: orderId,
                userId: user.uid,
                items: items,
                totalAmount: totalPrice,
                status: 'pending',
                createdAt: new Date() as any, // This is temporary, server will set the real timestamp
            };
            
            const userDetails = {
                id: user.uid,
                name: user.displayName || 'Pengguna',
                email: user.email || '',
            };

            const paymentState = await getPaymentToken(orderDetails, userDetails);

            if (paymentState.error || !paymentState.token) {
                 toast({ title: "Pembayaran Gagal", description: paymentState.error, variant: "destructive" });
                 return;
            }

            window.snap.pay(paymentState.token, {
                onSuccess: async function(result: any){
                    toast({ title: "Pembayaran Berhasil!", description: "Terima kasih, pesanan Anda sedang diproses." });
                    await handleSuccessfulPayment(orderId, result);
                    clearCart();
                    router.push(`/akun/riwayat-pesanan/${orderId}`);
                },
                onPending: function(result: any){
                    toast({ title: "Pembayaran Tertunda", description: "Menunggu pembayaran Anda selesai." });
                    router.push(`/akun/riwayat-pesanan/${orderId}`);
                },
                onError: function(result: any){
                    toast({ title: "Pembayaran Gagal", description: "Terjadi kesalahan saat memproses pembayaran.", variant: "destructive" });
                },
                onClose: function(){
                    toast({ title: "Pembayaran Dibatalkan", description: "Anda menutup jendela pembayaran sebelum selesai.", variant: "default" });
                }
            });

        });
    }

    if (items.length === 0) {
        return (
            <div className="container py-12">
                <EmptyCart />
            </div>
        );
    }

    return (
        <div className="container py-12">
            <h1 className="font-headline text-3xl md:text-4xl font-bold mb-8">Keranjang Belanja</h1>
            <div className="grid md:grid-cols-3 gap-8 items-start">
                <div className="md:col-span-2 space-y-4">
                    {items.map(item => (
                        <Card key={item.id} className="flex items-center p-4">
                            <Image src={item.imageUrl} alt={item.name} width={80} height={80} className="rounded-md object-cover" />
                            <div className="ml-4 flex-grow">
                                <h3 className="font-semibold">{item.name}</h3>
                                <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Input 
                                    type="number" 
                                    min="1" 
                                    value={item.quantity} 
                                    onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value))}
                                    className="w-16 h-9 text-center"
                                />
                                <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Hapus item</span>
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="md:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ringkasan Pesanan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span>Subtotal ({totalItems} item)</span>
                                <span>{formatPrice(totalPrice)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Ongkos Kirim</span>
                                <span>Gratis</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>{formatPrice(totalPrice)}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isPending}>
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        <span>Memproses...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Lanjut ke Pembayaran</span>
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}

    
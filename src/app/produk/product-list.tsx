'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query as firestoreQuery, type CollectionReference } from 'firebase/firestore';
import type { DigitalProduct } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

function ProductSkeleton() {
  return (
    <Card className="flex flex-col">
      <Skeleton className="w-full h-52" />
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="flex-grow">
        <Skeleton className="h-4 w-full mt-1" />
        <Skeleton className="h-4 w-5/6 mt-1" />
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-10 w-1/3" />
      </CardFooter>
    </Card>
  );
}


export function ProductList() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isBuying, setIsBuying] = useState<string | null>(null);

  // Load Midtrans Snap.js script
  useEffect(() => {
    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = "Mid-client-35fgBhK8ianqJP3d";

    const script = document.createElement('script');
    script.src = snapScript;
    script.setAttribute('data-client-key', clientKey);
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    }
  }, []);

  const handleBuy = async (product: DigitalProduct) => {
    if (!user) {
        toast({
            title: "Harap Login",
            description: "Anda harus login terlebih dahulu untuk melakukan pembelian.",
            variant: "destructive"
        });
        router.push('/login');
        return;
    }

    setIsBuying(product.id);
    try {
        const response = await fetch('/api/create-transaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ product, user }),
        });

        const transaction = await response.json();
        
        if (response.ok) {
            // Because we are using Core API, we don't get a redirect_url.
            // Instead, we get a token that we can use with Snap.js to pay.
            // The response 'transaction' object from our API is the full response from Midtrans.
             if (transaction.token) {
                (window as any).snap.pay(transaction.token, {
                    onSuccess: function(result: any){
                        router.push(`/pembayaran/selesai?order_id=${result.order_id}`);
                    },
                    onPending: function(result: any){
                        // For Gopay, pending means waiting for payment. Redirect to status page.
                        // You might want to create a specific pending page.
                        router.push(`/akun/riwayat-pesanan`);
                    },
                    onError: function(result: any){
                         router.push(`/pembayaran/gagal?order_id=${result.order_id}`);
                    },
                    onClose: function(){
                        toast({
                            title: "Pembayaran Dibatalkan",
                            description: "Anda menutup jendela pembayaran sebelum selesai.",
                            variant: "destructive"
                        });
                    }
                });
            } else if (transaction.actions) {
                 // Handle payments like Gopay QR which provide actions instead of a token
                 const gopayQrUrl = transaction.actions.find((action: {name: string}) => action.name === 'generate-qr-code')?.url;
                 if (gopayQrUrl) {
                     // For QRIS, you might want to show a modal with the QR code
                     // For simplicity, we'll just log it. A real app would show the QR.
                     console.log("Gopay QR URL:", gopayQrUrl);
                     toast({
                         title: "Pindai Kode QR",
                         description: "Silakan pindai kode QR dengan aplikasi Gojek Anda.",
                     });
                     // Here you would typically show a modal with an iframe or QR image
                 } else {
                    throw new Error('Metode pembayaran tidak didukung saat ini.');
                 }
            } else {
                 throw new Error(transaction.status_message || 'Respons tidak valid dari server.');
            }
        } else {
            throw new Error(transaction.error || 'Gagal membuat transaksi.');
        }

    } catch (err: any) {
        console.error("Payment error:", err);
        toast({
            title: "Pembayaran Gagal",
            description: err.message || "Terjadi kesalahan saat memulai pembayaran.",
            variant: "destructive",
        });
    } finally {
        setIsBuying(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading || isUserLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center col-span-full py-12 border rounded-lg bg-destructive/10 border-destructive">
          <h3 className="text-xl font-semibold text-destructive-foreground">Akses Database Gagal</h3>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Terjadi kesalahan saat memuat data produk. Pastikan aturan keamanan Firestore Anda telah benar dan koleksi 'digitalProducts' ada di database Anda.
          </p>
          <p className="text-xs text-muted-foreground mt-4">{error.message}</p>
      </div>
    );
  }

  if (!isLoading && (!products || products.length === 0)) {
    return (
      <div className="text-center col-span-full py-12 border rounded-lg">
          <h3 className="text-xl font-semibold">Belum Ada Produk</h3>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Saat ini belum ada produk digital yang tersedia. Coba tambahkan beberapa di konsol Firebase pada koleksi 'digitalProducts'.
          </p>
      </div>
     );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {products?.map((product) => (
        <Card key={product.id} className="flex flex-col">
          <div className="relative w-full aspect-[4/3] overflow-hidden rounded-t-lg">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              data-ai-hint={product.imageHint || 'digital product'}
            />
          </div>
          <CardHeader>
            <CardTitle>{product.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-muted-foreground text-sm">{product.description}</p>
          </CardContent>
          <CardFooter className="flex justify-between items-center pt-4">
            <p className="font-semibold text-lg">{formatPrice(product.price)}</p>
            <Button onClick={() => handleBuy(product)} disabled={isBuying === product.id}>
                {isBuying === product.id ? 'Memproses...' : <ShoppingCart className="mr-2 h-4 w-4" />}
                {isBuying === product.id ? '' : 'Beli'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

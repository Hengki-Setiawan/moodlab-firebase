'use client';

import Image from 'next/image';
import { useState, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query as firestoreQuery, type CollectionReference } from 'firebase/firestore';
import type { DigitalProduct } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { getPaymentToken } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    snap: any;
  }
}

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

function BuyButton({ product }: { product: DigitalProduct }) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleBuy = () => {
        startTransition(async () => {
            const { token, error } = await getPaymentToken(product);

            if (error) {
                toast({
                    title: "Pembayaran Gagal",
                    description: error,
                    variant: "destructive"
                });
                return;
            }

            if (token) {
                window.snap.pay(token, {
                    onSuccess: function(result: any){
                        console.log('success', result);
                        toast({
                            title: "Pembayaran Berhasil!",
                            description: "Terima kasih atas pembelian Anda.",
                        });
                    },
                    onPending: function(result: any){
                        console.log('pending', result);
                        toast({
                            title: "Pembayaran Tertunda",
                            description: "Menunggu pembayaran Anda selesai.",
                        });
                    },
                    onError: function(result: any){
                        console.log('error', result);
                        toast({
                            title: "Pembayaran Gagal",
                            description: "Terjadi kesalahan saat memproses pembayaran.",
                            variant: "destructive",
                        });
                    },
                    onClose: function(){
                        console.log('customer closed the popup without finishing the payment');
                    }
                });
            }
        });
    };

    return (
        <Button onClick={handleBuy} disabled={isPending}>
            {isPending ? 'Memproses...' : 'Beli Sekarang'}
        </Button>
    )
}

export function ProductList() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return firestoreQuery(collection(firestore, 'digitalProducts')) as CollectionReference<DigitalProduct>;
  }, [firestore]);

  const { data: products, isLoading, error } = useCollection<DigitalProduct>(productsQuery);
  
  useEffect(() => {
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    if (!clientKey) {
        console.error("Midtrans client key is not set.");
        toast({
            title: "Konfigurasi Error",
            description: "Kunci klien untuk pembayaran tidak ditemukan.",
            variant: "destructive"
        });
        return;
    }
    
    const script = document.createElement('script');
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js"; // Use sandbox for development
    script.setAttribute('data-client-key', clientKey);
    script.async = true;
    
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    }
  }, [toast]);


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
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
            <BuyButton product={product} />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

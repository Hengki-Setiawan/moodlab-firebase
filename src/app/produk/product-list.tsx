'use client';

import { useState } from 'react';
import Image from 'next/image';
import Script from 'next/script';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser, useDatabase, useMemoFirebase } from '@/firebase';
import { useRtdbList } from '@/firebase/rtdb/use-rtdb-list';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { ref } from 'firebase/database';
import { Skeleton } from '@/components/ui/skeleton';
import { seedDatabase } from '../actions';

declare global {
    interface Window {
        snap: any;
    }
}

function ProductSkeleton() {
    return (
        <Card className="flex flex-col">
            <CardHeader className="p-0">
                <Skeleton className="h-64 w-full rounded-t-lg" />
            </CardHeader>
            <CardContent className="p-6 flex-grow">
                <Skeleton className="h-4 w-1/4 mb-2" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full mt-1" />
            </CardContent>
            <CardFooter className="p-6 pt-0 flex justify-between items-center">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-10 w-1/2" />
            </CardFooter>
        </Card>
    )
}

export function ProductList() {
  const [isMidtransReady, setMidtransReady] = useState(false);
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const database = useDatabase();

  const productsRef = useMemoFirebase(() => {
    if (!database) return null;
    return ref(database, 'products');
  }, [database]);

  const { data: products, isLoading: isLoadingProducts, error } = useRtdbList<Product>(productsRef);

  const handleSeedDb = async () => {
    setIsSeeding(true);
    try {
        const result = await seedDatabase();
        if (result.success) {
            toast({
                title: "Database Diisi!",
                description: result.message || "Produk awal telah ditambahkan.",
            });
        } else {
            toast({
                title: "Gagal Mengisi Database",
                description: result.message || "Tindakan ini mungkin sudah pernah dilakukan.",
                variant: 'destructive',
            });
        }
    } catch (e: any) {
        toast({
            title: "Error",
            description: e.message || "Terjadi kesalahan saat mengisi database.",
            variant: 'destructive',
        });
    } finally {
        setIsSeeding(false);
    }
  }

  const handleBuy = async (product: Product) => {
    if (!user) {
        toast({
            title: 'Harap Login',
            description: 'Anda harus login terlebih dahulu untuk melakukan pembelian.',
            variant: 'destructive',
        });
        return;
    }

    if (!user.email) {
        toast({
            title: 'Email Diperlukan',
            description: 'Akun Anda tidak memiliki email. Email diperlukan untuk melanjutkan pembayaran.',
            variant: 'destructive',
        });
        return;
    }

    setLoadingProductId(product.id);

    try {
        const transactionData = {
            orderId: `order-${product.id}-${Date.now()}`,
            amount: product.price,
            productName: product.name,
            productId: product.id,
            customerEmail: user.email,
        };

        const response = await fetch('/api/create-transaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transactionData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Gagal membuat transaksi.');
        }
        
        const { token } = await response.json();

        if (token) {
            window.snap.pay(token, {
                onSuccess: function(result: any){
                  console.log('Payment success!', result);
                  toast({ title: "Pembayaran Berhasil!", description: "Terima kasih, produk akan segera tersedia di akun Anda."});
                  setLoadingProductId(null);
                },
                onPending: function(result: any){
                  console.log('Payment pending.', result);
                  toast({ title: "Menunggu Pembayaran", description: "Selesaikan pembayaran Anda."});
                  setLoadingProductId(null);
                },
                onError: function(result: any){
                  console.error('Payment error!', result);
                  toast({ title: "Pembayaran Gagal", description: "Terjadi kesalahan. Silakan coba lagi.", variant: 'destructive' });
                  setLoadingProductId(null);
                },
                onClose: function(){
                  console.log('Payment popup closed.');
                  setLoadingProductId(null);
                }
              });
        } else {
            throw new Error("Gagal mendapatkan token transaksi.");
        }

    } catch (error: any) {
        console.error("Error creating transaction", error);
        toast({
            title: "Terjadi Kesalahan",
            description: error.message || "Tidak dapat memproses pembayaran saat ini. Silakan coba lagi nanti.",
            variant: 'destructive',
        });
        setLoadingProductId(null);
    }
  };

  if (isLoadingProducts) {
      return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => <ProductSkeleton key={i} />)}
          </div>
      )
  }

  // Handle permission error
  if (error) {
      return (
        <div className="text-center col-span-full py-12 border rounded-lg bg-destructive/10 border-destructive">
          <h3 className="text-xl font-semibold text-destructive-foreground">Akses Ditolak</h3>
          <p className="text-muted-foreground mt-2">
            Aturan keamanan database Anda saat ini tidak mengizinkan pembacaan data. <br/>
            Silakan perbarui aturan Realtime Database Anda di Firebase Console.
          </p>
        </div>
      )
  }

  return (
    <>
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        onLoad={() => setMidtransReady(true)}
      />

    {products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
                <Card key={product.id} className="flex flex-col">
                    <CardHeader className="p-0">
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={600}
                        height={400}
                        className="object-cover w-full h-64 rounded-t-lg"
                        data-ai-hint={product.imageHint || 'product image'}
                    />
                    </CardHeader>
                    <CardContent className="p-6 flex-grow">
                    <Badge variant="secondary" className="mb-2">{product.category}</Badge>
                    <h3 className="font-headline text-xl font-semibold">{product.name}</h3>
                    <p className="text-muted-foreground mt-2 text-sm">{product.description}</p>
                    </CardContent>
                    <CardFooter className="p-6 pt-0 flex justify-between items-center">
                    <p className="text-xl font-bold text-primary">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price)}
                    </p>
                    <Button 
                        onClick={() => handleBuy(product)} 
                        disabled={!isMidtransReady || isUserLoading || !!loadingProductId}
                    >
                        {loadingProductId === product.id ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Memproses...
                            </>
                        ) : (
                            <>
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Beli Sekarang
                            </>
                        )}
                    </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
      ) : (
        <div className="text-center col-span-full py-12 border rounded-lg">
          <h3 className="text-xl font-semibold">Database Produk Kosong</h3>
          <p className="text-muted-foreground mt-2 mb-4">
            Klik tombol di bawah untuk mengisi database Anda dengan produk awal.
          </p>
          <Button onClick={handleSeedDb} disabled={isSeeding}>
            {isSeeding ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengisi...</> : 'Isi Database Produk'}
          </Button>
        </div>
      )}
    </>
  );
}

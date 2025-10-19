'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Script from 'next/script';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser, useDatabase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { ref, onValue, off } from 'firebase/database';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const database = useDatabase();

  useEffect(() => {
    if (!database) {
        setIsLoading(false);
        // We don't set an error here because the database might just be initializing.
        // The provider handles the availability of the service.
        return;
    }

    const productsRef = ref(database, 'products'); // Reference to the 'products' node
    setIsLoading(true);

    const unsubscribe = onValue(productsRef, 
      (snapshot) => {
        try {
            if (snapshot.exists()) {
                const productsObject = snapshot.val();
                if (productsObject && typeof productsObject === 'object') {
                    const productsArray: Product[] = Object.keys(productsObject).map(key => ({
                        ...(productsObject[key] as Omit<Product, 'id'>),
                        id: key,
                    }));
                    setProducts(productsArray);
                } else {
                    setProducts([]);
                }
            } else {
                setProducts([]);
            }
            setError(null);
        } catch(e: any) {
            console.error("Error processing snapshot:", e);
            setError(new Error("Gagal memproses data produk."));
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
      }, 
      (error) => {
        console.error("Firebase onValue error:", error);
        setError(error);
        setProducts([]);
        setIsLoading(false);
      }
    );

    // Cleanup subscription on component unmount
    return () => off(productsRef, 'value', unsubscribe);

  }, [database]);


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

  const renderContent = () => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => <ProductSkeleton key={i} />)}
            </div>
        );
    }
  
    if (error) {
        return (
          <div className="text-center col-span-full py-12 border rounded-lg bg-destructive/10 border-destructive">
            <h3 className="text-xl font-semibold text-destructive-foreground">Akses Database Gagal</h3>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Gagal membaca data dari Realtime Database. Ini bisa terjadi karena aturan keamanan (security rules) tidak mengizinkan akses baca. Pastikan Anda telah mengatur database Anda ke "Test Mode" di Firebase Console. Error: {error.message}
            </p>
          </div>
        );
    }
    
    if (!products || products.length === 0) {
        return (
          <div className="text-center col-span-full py-12 border rounded-lg">
            <h3 className="text-xl font-semibold">Belum Ada Produk</h3>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Saat ini belum ada produk yang tersedia. Jika Anda baru saja mengimpor data, silakan tunggu beberapa saat atau segarkan halaman.
            </p>
          </div>
        );
    }

    return (
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
                        disabled={isUserLoading || !!loadingProductId}
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
    );
  };

  return (
    <>
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="beforeInteractive"
      />
      {renderContent()}
    </>
  );
}
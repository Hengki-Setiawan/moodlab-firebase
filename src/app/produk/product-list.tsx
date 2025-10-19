'use client';

import { useState } from 'react';
import Image from 'next/image';
import Script from 'next/script';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dummyProducts } from '@/lib/data';
import { useUser } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';
import { ShoppingCart } from 'lucide-react';

// You need to declare this so TypeScript knows about the snap object
declare global {
    interface Window {
        snap: any;
    }
}

export function ProductList() {
  const [isMidtransReady, setMidtransReady] = useState(false);
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const handleBuy = async (product: Product) => {
    if (!user) {
        toast({
            title: 'Harap Login',
            description: 'Anda harus login terlebih dahulu untuk melakukan pembelian.',
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
            customerEmail: user.email, // Pass user email to API route
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


  return (
    <>
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        onLoad={() => setMidtransReady(true)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {dummyProducts.map((product) => (
          <Card key={product.id} className="flex flex-col">
            <CardHeader className="p-0">
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={600}
                height={400}
                className="object-cover w-full h-64 rounded-t-lg"
                data-ai-hint={product.imageHint}
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
                {loadingProductId === product.id ? 'Memproses...' : (
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
    </>
  );
}

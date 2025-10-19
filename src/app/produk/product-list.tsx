'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser, useFirestore, useFirebaseApp } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { collection, doc, setDoc } from 'firebase/firestore';

declare global {
    interface Window {
        snap: any;
    }
}

async function sendReceipt(customerEmail: string, product: Product) {
    try {
        const response = await fetch('/api/send-receipt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ customerEmail, product }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Gagal mengirim struk.');
        }

        console.log("Struk berhasil dikirim.");

    } catch (error) {
        console.error("Error sending receipt:", error);
    }
}

async function saveTransaction(
    firestore: any, 
    userId: string, 
    transactionData: any
) {
    if (!firestore || !userId) return;
    try {
        const transactionRef = doc(collection(firestore, `users/${userId}/transactions`), transactionData.orderId);
        await setDoc(transactionRef, transactionData);
        console.log("Transaksi berhasil disimpan ke Firestore.");
    } catch (error) {
        console.error("Gagal menyimpan transaksi ke Firestore:", error);
        // We log the error but don't show it to the user to not interrupt the flow
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
  const [error, setError] = useState<string | null>(null);
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const app = useFirebaseApp();

  useEffect(() => {
    if (!app) {
      setIsLoading(false);
      setError("Koneksi Firebase belum siap.");
      return;
    }

    const database = getDatabase(app);
    // Mengacu pada 'products' yang ada di root Realtime Database Anda.
    const productsRef = ref(database, 'products');
    
    setIsLoading(true);
    const listener = onValue(productsRef, 
      (snapshot) => {
        if (snapshot.exists()) {
          const productsObject = snapshot.val();
          const productsArray: Product[] = Object.keys(productsObject).map(key => ({
            id: key,
            ...productsObject[key]
          }));
          setProducts(productsArray);
          setError(null);
        } else {
          setProducts([]);
          setError("Tidak ada produk yang ditemukan di database.");
          console.log("Tidak ada produk ditemukan di path 'products'.");
        }
        setIsLoading(false);
      }, 
      (error) => {
        console.error("Firebase Realtime Database error:", error);
        setError(`Gagal membaca data dari Realtime Database. Pastikan security rules Anda mengizinkan akses baca. Error: ${error.message}`);
        setIsLoading(false);
      }
    );

    return () => {
      off(productsRef, 'value', listener);
    };
  }, [app]);


  const handleBuy = async (product: Product) => {
    if (isUserLoading) return;

    if (!user) {
        toast({
            title: 'Harap Login',
            description: 'Anda harus login terlebih dahulu untuk melakukan pembelian.',
            variant: 'destructive',
        });
        return;
    }

    if (!user.emailVerified) {
        toast({
            title: 'Verifikasi Email Diperlukan',
            description: 'Silakan verifikasi email Anda terlebih dahulu sebelum membeli.',
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
        const orderId = `order-${product.id}-${Date.now()}`;
        const transactionPayload = {
            orderId: orderId,
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
            body: JSON.stringify(transactionPayload),
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
                  toast({ title: "Pembayaran Berhasil!", description: "Struk pembelian sedang dikirim ke email Anda."});
                  
                  const transactionToSave = {
                      orderId: result.order_id,
                      productName: product.name,
                      amount: parseFloat(result.gross_amount),
                      transactionTime: result.transaction_time,
                      status: 'success' as const,
                      userId: user.uid,
                  };
                  saveTransaction(firestore, user.uid, transactionToSave);
                  
                  if(user.email) {
                    sendReceipt(user.email, product);
                  }
                  setLoadingProductId(null);
                },
                onPending: function(result: any){
                  console.log('Payment pending.', result);
                  toast({ title: "Menunggu Pembayaran", description: "Selesaikan pembayaran Anda."});

                   const transactionToSave = {
                      orderId: result.order_id,
                      productName: product.name,
                      amount: parseFloat(result.gross_amount),
                      transactionTime: new Date().toISOString(),
                      status: 'pending' as const,
                      userId: user.uid,
                  };
                  saveTransaction(firestore, user.uid, transactionToSave);
                  setLoadingProductId(null);
                },
                onError: function(result: any){
                  console.error('Payment error!', result);
                  toast({ title: "Pembayaran Gagal", description: "Terjadi kesalahan. Silakan coba lagi.", variant: 'destructive' });
                  
                  const transactionToSave = {
                      orderId: orderId, // Use the generated orderId
                      productName: product.name,
                      amount: product.price,
                      transactionTime: new Date().toISOString(),
                      status: 'failure' as const,
                      userId: user.uid,
                  };
                  saveTransaction(firestore, user.uid, transactionToSave);
                  setLoadingProductId(null);
                },
                onClose: function(){
                  console.log('Payment popup closed.');
                  setLoadingProductId(null); // Reset loading state
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
            {error}
          </p>
        </div>
      );
  }
  
  if (products.length === 0) {
      return (
        <div className="text-center col-span-full py-12 border rounded-lg">
          <h3 className="text-xl font-semibold">Belum Ada Produk</h3>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Tidak ada produk yang ditemukan di database. Pastikan data diimpor di bawah node 'products' dan security rules mengizinkan baca.
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
}

    
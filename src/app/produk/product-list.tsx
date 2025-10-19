'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query as firestoreQuery, type CollectionReference } from 'firebase/firestore';
import type { DigitalProduct } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

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

  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return firestoreQuery(collection(firestore, 'digitalProducts')) as CollectionReference<DigitalProduct>;
  }, [firestore]);

  const { data: products, isLoading, error } = useCollection<DigitalProduct>(productsQuery);

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
            <Button>Beli Sekarang</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

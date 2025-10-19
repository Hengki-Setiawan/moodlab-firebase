'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, type CollectionReference } from 'firebase/firestore';
import type { Project } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function ProjectSkeleton() {
  return (
    <Card className="overflow-hidden h-full">
      <Skeleton className="w-full h-64" />
      <div className="p-6">
        <Skeleton className="h-5 w-1/4 mb-2" />
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mt-1" />
        <Skeleton className="h-4 w-full mt-1" />
      </div>
    </Card>
  );
}

export default function PortfolioPage() {
  const [filter, setFilter] = useState('Semua');
  const firestore = useFirestore();

  const projectsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const projectsCollection = collection(firestore, 'projects') as CollectionReference<Project>;
    if (filter === 'Semua') {
      return query(projectsCollection);
    }
    return query(projectsCollection, where('category', '==', filter));
  }, [firestore, filter]);

  const { data: projects, isLoading, error } = useCollection<Project>(projectsQuery);

  const categories = [
    'Semua', 
    'Kampanye Instagram', 
    'Konten TikTok', 
    'Strategi Merek', 
    'Produk Digital'
  ];
  
  return (
    <>
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-headline text-4xl md:text-5xl font-bold">Portofolio</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Inilah beberapa karya yang telah kami ciptakan bersama klien-klien hebat kami.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="flex justify-center mb-12">
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {isLoading && (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => <ProjectSkeleton key={i} />)}
             </div>
          )}

          {error && (
            <div className="text-center col-span-full py-12 border rounded-lg bg-destructive/10 border-destructive">
                <h3 className="text-xl font-semibold text-destructive-foreground">Akses Database Gagal</h3>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                    Terjadi kesalahan saat memuat data portofolio. Pastikan aturan keamanan Firestore Anda telah benar dan coba lagi.
                </p>
                <p className="text-xs text-muted-foreground mt-4">{error.message}</p>
            </div>
          )}

          {!isLoading && !error && projects && projects.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, index) => {
                return (
                  <div key={project.id} className="group animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                    <Card className="overflow-hidden h-full">
                      <CardContent className="p-0">
                        <Image
                          src={project.imageUrl || '/placeholder.jpg'}
                          alt={project.clientName}
                          width={600}
                          height={400}
                          className="object-cover w-full h-64 transition-transform duration-300 group-hover:scale-105"
                          data-ai-hint={'project screenshot'}
                        />
                        <div className="p-6">
                          <Badge variant="secondary" className="mb-2">{project.category}</Badge>
                          <h3 className="font-headline text-xl font-semibold">{project.clientName}</h3>
                          <p className="text-muted-foreground mt-1">{project.title}</p>
                          <p className="text-sm text-muted-foreground mt-3">{project.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
           {!isLoading && !error && (!projects || projects.length === 0) && (
            <div className="text-center col-span-full py-12 border rounded-lg">
                <h3 className="text-xl font-semibold">Belum Ada Portofolio</h3>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                    Tidak ada portofolio yang ditemukan untuk kategori ini. Coba tambahkan beberapa di konsol Firebase pada koleksi 'projects'.
                </p>
            </div>
           )}
        </div>
      </section>
    </>
  );
}

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { projects } from '@/lib/data';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';

const categories = [
  'Semua', 
  ...Array.from(new Set(projects.map(p => p.category)))
];

export default function PortfolioPage() {
  const [filter, setFilter] = useState('Semua');

  const filteredProjects = projects.filter(
    (project) => filter === 'Semua' || project.category === filter
  );

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => {
              const portfolioImage = getPlaceholderImage(project.image);
              return (
                <div key={index} className="group animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                  <Card className="overflow-hidden h-full">
                    <CardContent className="p-0">
                      <Image
                        src={portfolioImage?.imageUrl || '/placeholder.jpg'}
                        alt={project.client}
                        width={600}
                        height={400}
                        className="object-cover w-full h-64 transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint={portfolioImage?.imageHint || 'project screenshot'}
                      />
                      <div className="p-6">
                        <Badge variant="secondary" className="mb-2">{project.category}</Badge>
                        <h3 className="font-headline text-xl font-semibold">{project.client}</h3>
                        <p className="text-muted-foreground mt-1">{project.title}</p>
                        <p className="text-sm text-muted-foreground mt-3">{project.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

import Image from 'next/image';
import { services } from '@/lib/data';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { CheckCircle } from 'lucide-react';

export default function LayananPage() {
  return (
    <>
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-headline text-4xl md:text-5xl font-bold">Layanan Kami</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Solusi kreatif dan strategis untuk membawa merek Anda lebih dekat dengan audiens target.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container space-y-20">
          {services.map((service, index) => {
            const serviceImage = getPlaceholderImage(service.image);
            return (
              <div 
                key={service.title} 
                className={`grid md:grid-cols-2 gap-12 items-center ${index % 2 !== 0 ? 'md:grid-flow-row-dense' : ''}`}
              >
                <div className={`relative ${index % 2 !== 0 ? 'md:col-start-2' : ''}`}>
                  <Image
                    src={serviceImage?.imageUrl || '/placeholder.jpg'}
                    alt={service.title}
                    width={600}
                    height={400}
                    className="rounded-lg object-cover shadow-lg"
                    data-ai-hint={serviceImage?.imageHint || 'service illustration'}
                  />
                </div>
                <div>
                  <service.icon className="h-10 w-10 mb-4 text-primary"/>
                  <h2 className="font-headline text-3xl font-bold mb-4">{service.title}</h2>
                  <p className="text-muted-foreground text-lg leading-relaxed">{service.longDescription}</p>
                  <ul className="mt-6 space-y-2">
                      <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                          <span>Strategi Berbasis Data</span>
                      </li>
                      <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                          <span>Eksekusi Kreatif</span>
                      </li>
                      <li className="flex items-center">
                          <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                          <span>Laporan Performa</span>
                      </li>
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { team, values } from '@/lib/data';
import { getPlaceholderImage } from '@/lib/placeholder-images';

export default function TentangKamiPage() {
  return (
    <>
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-headline text-4xl md:text-5xl font-bold">Tentang Mood Lab</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Kami adalah agensi penerjemah budaya yang membantu merek terhubung secara otentik dengan Generasi Digital.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid md:grid-cols-5 gap-12 items-center">
            <div className="md:col-span-2">
              <h2 className="font-headline text-3xl font-bold">Visi & Misi Kami</h2>
            </div>
            <div className="md:col-span-3">
              <h3 className="font-headline text-xl font-semibold text-primary">Visi</h3>
              <p className="text-muted-foreground mt-2 mb-6">
                Menjadi mitra andalan bagi UMKM yang ingin bertumbuh dan relevan di tengah lanskap budaya digital yang terus berubah.
              </p>
              <h3 className="font-headline text-xl font-semibold text-primary">Misi</h3>
              <ul className="list-disc list-inside space-y-2 mt-2 text-muted-foreground">
                <li>Menerjemahkan tren dan insight Gen Z menjadi strategi merek yang efektif.</li>
                <li>Menciptakan konten yang tidak hanya dilihat, tetapi juga dirasakan dan dibagikan.</li>
                <li>Memberdayakan UMKM dengan pengetahuan dan alat untuk mandiri di dunia digital.</li>
                <li>Membangun jembatan komunikasi yang jujur dan otentik antara merek dan konsumen.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-secondary">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Prinsip Kerja Kami</h2>
            <p className="text-muted-foreground text-lg mt-2 max-w-2xl mx-auto">
              Nilai-nilai fundamental yang menjadi kompas dalam setiap langkah kami.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <Card key={value.title} className="text-center">
                <CardHeader>
                  <CardTitle className="font-headline">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Tim di Balik Mood Lab</h2>
            <p className="text-muted-foreground text-lg mt-2">
              Para ahli strategi, kreator, dan analis yang siap membantu Anda.
            </p>
          </div>
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            className="w-full max-w-4xl mx-auto"
          >
            <CarouselContent>
              {team.map((member) => {
                const teamImage = getPlaceholderImage(member.image);
                return (
                  <CarouselItem key={member.name} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <Card className="text-center">
                        <CardContent className="p-6 flex flex-col items-center">
                          <Image
                            src={teamImage?.imageUrl || '/placeholder.jpg'}
                            alt={`Profile picture of ${member.name}`}
                            width={120}
                            height={120}
                            className="rounded-full mb-4"
                            data-ai-hint={teamImage?.imageHint || 'professional person'}
                          />
                          <h3 className="font-headline text-xl font-semibold">{member.name}</h3>
                          <p className="text-primary font-medium">{member.role}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        </div>
      </section>
    </>
  );
}

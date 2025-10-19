import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { services, projects as staticProjects } from "@/lib/data"; 
import { getPlaceholderImage } from "@/lib/placeholder-images";

export default function Home() {
  const featuredProjects = staticProjects.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 lg:py-48 text-center animate-in fade-in slide-in-from-bottom-12 duration-500">
          <div className="absolute inset-0 bg-white bg-opacity-50 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-gradient-blue/10 via-gradient-purple/10 to-gradient-pink/10"></div>
          </div>
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-4">
                <span className="bg-gradient-to-r from-gradient-blue via-gradient-purple to-gradient-pink text-transparent bg-clip-text">
                  mood up
                </span>
                , brand up.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Kami membantu UMKM kekinian membangun koneksi otentik dengan Gen
                Z melalui konten yang relevan secara emosional.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/tentang-dan-portofolio">Lihat Portofolio Kami</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/kontak">Hubungi Kami</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* About Us Summary */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4">
              Penerjemah Budaya Generasi Digital
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
              Di Mood Lab, kami tidak hanya mengikuti tren, kami
              memahaminya. Kami hadir untuk menjembatani merek Anda dengan
              audiens Gen Z yang dinamis, mengubah hype sesaat menjadi
              loyalitas jangka panjang melalui strategi yang didasarkan pada
              empati dan data.
            </p>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="font-headline text-3xl md:text-4xl font-bold">
                Layanan yang Kami Tawarkan
              </h2>
              <p className="text-muted-foreground text-lg mt-2">
                Solusi lengkap untuk pertumbuhan merek Anda di era digital.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <Card key={index} className="flex flex-col text-center items-center hover:shadow-lg transition-shadow duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardHeader>
                    <div className="mx-auto bg-gradient-to-br from-gradient-blue/20 to-gradient-pink/20 p-4 rounded-full">
                      <service.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="font-headline pt-4">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Portfolio */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="font-headline text-3xl md:text-4xl font-bold">
                Karya yang Telah Kami Ciptakan
              </h2>
              <p className="text-muted-foreground text-lg mt-2">
                Lihat bagaimana kami membantu klien mencapai tujuan mereka.
              </p>
            </div>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {featuredProjects.map((project, index) => {
                  const portfolioImage = getPlaceholderImage(project.image);
                  return (
                    <CarouselItem
                      key={index}
                      className="md:basis-1/2 lg:basis-1/3"
                    >
                      <Link href="/tentang-dan-portofolio">
                        <div className="group overflow-hidden rounded-lg">
                          <Card className="h-full">
                            <CardContent className="p-0">
                              <Image
                                src={portfolioImage?.imageUrl || "/placeholder.jpg"}
                                alt={project.clientName}
                                width={600}
                                height={400}
                                className="object-cover w-full h-64 transition-transform duration-300 group-hover:scale-105"
                                data-ai-hint={portfolioImage?.imageHint || 'project image'}
                              />
                              <div className="p-4">
                                <h3 className="font-headline text-xl font-semibold">
                                  {project.clientName}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {project.title}
                                </p>
                                <Badge variant="secondary" className="mt-2">{project.category}</Badge>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </Link>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 md:py-32">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter">
              Siap Membuat Merek Anda Tumbuh?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mt-4 mb-8 text-lg">
              Hubungi kami hari ini dan mari kita ciptakan sesuatu yang luar
              biasa bersama.
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-gradient-blue via-gradient-purple to-gradient-pink text-primary-foreground hover:opacity-90 transition-opacity">
              <Link href="/kontak">
                Mulai Proyek Anda Sekarang <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}

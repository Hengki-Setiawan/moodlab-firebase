import { Mail, Phone, MapPin } from 'lucide-react';
import { ContactForm } from './contact-form';
import Link from 'next/link';
import { Instagram } from 'lucide-react';
import { TikTokIcon } from '@/components/icons/tiktok';

export default function KontakPage() {
  return (
    <>
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-headline text-4xl md:text-5xl font-bold">Hubungi Kami</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Punya ide brilian atau butuh konsultasi? Kami siap mendengarkan.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid md:grid-cols-5 gap-12">
            <div className="md:col-span-3">
              <h2 className="font-headline text-3xl font-bold mb-6">Kirim Pesan</h2>
              <ContactForm />
            </div>
            <div className="md:col-span-2">
              <h2 className="font-headline text-3xl font-bold mb-6">Informasi Kontak</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Email</h3>
                    <a href="mailto:halo@moodlab.id" className="text-muted-foreground hover:text-primary transition-colors">
                      halo@moodlab.id
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Media Sosial</h3>
                    <div className="flex items-center space-x-4 mt-2">
                        <a href="#" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-muted-foreground hover:text-primary transition-colors">
                            <TikTokIcon className="h-6 w-6" />
                        </a>
                        <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors">
                            <Instagram className="h-6 w-6" />
                        </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

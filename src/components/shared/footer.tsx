import Link from "next/link";
import { Instagram } from "lucide-react";
import { Logo } from "./logo";
import { navItems } from "@/lib/data";
import { TikTokIcon } from "../icons/tiktok";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4 md:col-span-2">
            <Logo />
            <p className="text-muted-foreground max-w-md">
              Agensi penerjemah budaya yang mengubah hype sesaat menjadi loyalitas jangka panjang.
            </p>
          </div>
          <div>
            <h3 className="font-headline font-semibold mb-4">Navigasi</h3>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
               <li>
                  <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                    Login
                  </Link>
                </li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline font-semibold mb-4">Terhubung</h3>
            <div className="flex items-center space-x-4">
              <a href="#" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-muted-foreground hover:text-foreground transition-colors">
                <TikTokIcon className="h-6 w-6" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
            </div>
            <div className="mt-4">
                <a href="mailto:halo@moodlab.id" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    halo@moodlab.id
                </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Mood Lab. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

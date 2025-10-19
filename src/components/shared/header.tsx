"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/shared/logo";
import { useUser } from "@/firebase";

export function Header() {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();

  const primaryAction = isUserLoading ? (
    <Button disabled variant="ghost" size="icon">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
    </Button>
  ) : user ? (
    <Button asChild variant="ghost" size="icon">
      <Link href="/akun">
        <UserCircle2 className="h-6 w-6" />
        <span className="sr-only">Akun</span>
      </Link>
    </Button>
  ) : (
    <Button asChild>
      <Link href="/login">Login</Link>
    </Button>
  );

  const mobilePrimaryAction = isUserLoading ? (
     <Button disabled className="w-full">Memuat...</Button>
  ) : user ? (
    <Button asChild size="lg" className="w-full">
      <Link href="/akun">Lihat Akun</Link>
    </Button>
  ) : (
    <Button asChild size="lg" className="w-full bg-gradient-to-r from-gradient-blue via-gradient-purple to-gradient-pink text-primary-foreground">
      <Link href="/login">Login / Daftar</Link>
    </Button>
  );


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Logo />
        <nav className="hidden md:flex md:items-center md:gap-6 ml-auto text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === item.href
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto md:ml-4">
          <div className="hidden md:block">{primaryAction}</div>
        </div>

        <div className="md:hidden ml-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col h-full">
                <div className="flex justify-start p-2">
                  <Logo />
                </div>
                <nav className="flex flex-col gap-6 text-lg font-medium p-4 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={cn(
                        "transition-colors hover:text-foreground/80",
                        pathname === item.href
                          ? "text-foreground"
                          : "text-foreground/60"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto p-4">
                  {mobilePrimaryAction}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, UserCircle, LogOut, LogIn, UserPlus, User, ShoppingCart } from "lucide-react";
import { signOut, type Auth } from "firebase/auth";

import { cn } from "@/lib/utils";
import { navItems } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetClose, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/shared/logo";
import { useAuth, useUser } from "@/firebase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function AuthButtons({ auth }: { auth: Auth }) {
  const { user, isUserLoading } = useUser();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // You can add a toast notification here for successful logout
    } catch (error) {
      console.error("Error signing out: ", error);
      // You can add a toast notification for error
    }
  };

  if (isUserLoading) {
    return <div className="h-10 w-24 rounded-md animate-pulse bg-muted" />;
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2">
            <UserCircle />
            <span className="hidden sm:inline">{user.displayName || user.email}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="cursor-pointer">
             <Link href="/akun">
                <User className="mr-2 h-4 w-4" />
                <span>Profil Akun</span>
             </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
             <Link href="/akun/riwayat-pesanan">
                <ShoppingCart className="mr-2 h-4 w-4" />
                <span>Riwayat Pesanan</span>
             </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const showAuthButtons = !pathname.startsWith('/login') && !pathname.startsWith('/register');

  if (!showAuthButtons) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild>
        <Link href="/login">Login</Link>
      </Button>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const auth = useAuth();

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
        <div className="hidden md:flex items-center gap-4 ml-4">
          <AuthButtons auth={auth} />
        </div>
        <div className="md:hidden ml-auto flex items-center">
           <AuthButtons auth={auth} />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col h-full">
                <div className="flex justify-start p-2">
                  <Logo />
                </div>
                <nav className="flex flex-col gap-4 text-lg font-medium p-4 mt-8">
                  {navItems.map((item) => (
                     <SheetClose asChild key={item.href}>
                        <Link
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
                    </SheetClose>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

import Link from "next/link";
import { AccountDetails } from "./account-details";
import { Button } from "@/components/ui/button";
import { History, LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function AccountPage() {
  return (
    <div className="container py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Akun Saya</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Lihat dan kelola informasi profil dan riwayat pesanan Anda.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <nav className="md:col-span-1">
                <div className="flex flex-col space-y-2">
                  <Button variant="ghost" className="justify-start" asChild>
                      <Link href="/akun/riwayat-pesanan">
                          <History className="mr-2 h-4 w-4" />
                          Riwayat Pesanan
                      </Link>
                  </Button>
                  {/* Future links can be added here */}
                </div>
              </nav>

              <div className="md:col-span-2">
                <AccountDetails />
              </div>
            </div>
        </div>
    </div>
  );
}

    
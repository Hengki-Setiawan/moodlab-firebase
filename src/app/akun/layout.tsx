import type { ReactNode } from "react";
import Link from "next/link";
import { History, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="container py-12 md:py-16">
        <div className="grid md:grid-cols-4 gap-12">
            <aside className="md:col-span-1">
                <nav className="flex flex-col space-y-2">
                    <Button variant="ghost" className="justify-start" asChild>
                        <Link href="/akun">
                            <UserCircle className="mr-2 h-4 w-4" />
                            Profil
                        </Link>
                    </Button>
                    <Button variant="ghost" className="justify-start" asChild>
                        <Link href="/akun/riwayat-pesanan">
                            <History className="mr-2 h-4 w-4" />
                            Riwayat Pesanan
                        </Link>
                    </Button>
                </nav>
            </aside>
            <main className="md:col-span-3">
                {children}
            </main>
        </div>
    </div>
  );
}

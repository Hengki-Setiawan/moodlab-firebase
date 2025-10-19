import Link from 'next/link';
import { CircleX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentFailedPage({ searchParams }: { searchParams: { order_id: string } }) {
  const { order_id } = searchParams;

  return (
    <div className="container py-12 md:py-24">
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto bg-red-100 p-3 rounded-full w-fit">
              <CircleX className="h-10 w-10 text-red-600" />
            </div>
            <CardTitle className="mt-4 text-3xl font-bold font-headline">Pembayaran Gagal</CardTitle>
            <CardDescription className="text-lg">
              Maaf, terjadi masalah saat memproses pembayaran Anda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {order_id && (
              <p className="text-muted-foreground">
                Pesanan yang terkait: <span className="font-semibold text-foreground">{order_id}</span>
              </p>
            )}
            <p className="text-muted-foreground mt-2">
              Silakan coba lagi atau gunakan metode pembayaran lain.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Button asChild>
                <Link href="/produk">Coba Lagi</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/kontak">Hubungi Bantuan</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

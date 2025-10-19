import Link from 'next/link';
import { CircleCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentSuccessPage({ searchParams }: { searchParams: { order_id: string } }) {
  const { order_id } = searchParams;

  return (
    <div className="container py-12 md:py-24">
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto bg-green-100 p-3 rounded-full w-fit">
              <CircleCheck className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="mt-4 text-3xl font-bold font-headline">Pembayaran Berhasil!</CardTitle>
            <CardDescription className="text-lg">
              Terima kasih, pesanan Anda telah kami terima dan sedang diproses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Nomor Pesanan Anda adalah: <span className="font-semibold text-foreground">{order_id}</span>
            </p>
            <p className="text-muted-foreground mt-2">
              Anda dapat memeriksa status pesanan di halaman riwayat pesanan.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Button asChild>
                <Link href="/akun/riwayat-pesanan">Lihat Riwayat Pesanan</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/produk">Lanjut Belanja</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

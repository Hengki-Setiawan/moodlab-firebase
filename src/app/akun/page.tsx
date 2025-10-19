import { AccountDetails } from "./account-details";

export default function AccountPage() {
  return (
    <div className="container py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
            <div className="mb-8 text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Akun Saya</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Lihat dan kelola informasi profil Anda.
                </p>
            </div>
            <AccountDetails />
        </div>
    </div>
  );
}

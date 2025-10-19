import { ProductList } from './product-list';

export default function ProdukPage() {
  return (
    <>
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-headline text-4xl md:text-5xl font-bold">Produk Digital</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Tingkatkan skill dan pengetahuan Anda dengan produk-produk pilihan dari para ahli di bidangnya.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <ProductList />
        </div>
      </section>
    </>
  );
}

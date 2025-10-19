import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Text,
  Section,
  Row,
  Column,
} from '@react-email/components';
import type { Product } from '@/lib/types';

interface ReceiptEmailProps {
  product: Product;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:9002';

export const ReceiptEmail = ({ product }: ReceiptEmailProps) => {
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(product.price);

  return (
    <Html>
      <Head />
      <Preview>Struk Pembelian Anda dari Mood Lab Digital</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            {/* Ganti dengan URL logo Anda */}
            <Img
              src={`${baseUrl}/logo.png`}
              width="150"
              height="35"
              alt="Mood Lab Digital"
            />
          </Section>
          <Heading style={h1}>Terima kasih atas pembelian Anda!</Heading>
          <Text style={text}>
            Hai, kami telah menerima pembayaran Anda untuk produk di bawah ini. Anda dapat mengunduh file produk melalui tautan yang tersedia.
          </Text>
          
          <Section style={productSection}>
              <Row>
                  <Column>
                    <Text style={productTitle}>{product.name}</Text>
                    <Text style={productDescription}>{product.description}</Text>
                    <Link href={product.fileUrl || '#'} style={button}>
                        Unduh Produk
                    </Link>
                  </Column>
              </Row>
          </Section>

          <Text style={text}>
            Berikut adalah detail pesanan Anda:
          </Text>

          <Section style={tableContainer}>
            <Row>
              <Column>
                <Text style={tableHeader}>PRODUK</Text>
              </Column>
              <Column style={{ textAlign: 'right' }}>
                <Text style={tableHeader}>HARGA</Text>
              </Column>
            </Row>
            <Row style={tableRow}>
              <Column>{product.name}</Column>
              <Column style={tableCellPrice}>{formattedPrice}</Column>
            </Row>

            <Section style={hr} />

            <Row style={tableRow}>
                <Column style={tableCellTotal}>TOTAL</Column>
                <Column style={tableCellPriceTotal}>{formattedPrice}</Column>
            </Row>
          </Section>

          <Section style={{...text, marginTop: '28px'}}>
            <Text>
              Jika Anda memiliki pertanyaan, balas saja email ini. Kami siap membantu!
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Mood Lab Digital. All Rights Reserved.
            </Text>
            <Link href={`${baseUrl}`} style={footerLink}>
              moodlab.site
            </Link>
          </Section>

        </Container>
      </Body>
    </Html>
  );
};

export default ReceiptEmail;


const main = {
  fontFamily: '"Inter", sans-serif',
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
};

const container = {
  border: '1px solid #eaeaea',
  borderRadius: '4px',
  margin: '40px auto',
  padding: '20px',
  width: '465px',
};

const logoContainer = {
    textAlign: 'center' as const,
    paddingTop: '20px',
    paddingBottom: '20px',
};

const h1 = {
  color: '#1d1d1f',
  fontSize: '28px',
  fontWeight: '600',
  lineHeight: '1.3',
  margin: '20px 0',
};

const text = {
  color: '#555555',
  fontSize: '14px',
  lineHeight: '22px',
};

const productSection = {
    backgroundColor: '#f5f5f7',
    padding: '20px',
    borderRadius: '4px',
    marginBottom: '20px',
};

const productTitle = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1d1d1f',
    margin: '0 0 8px 0',
}
const productDescription = {
    fontSize: '14px',
    color: '#555555',
    margin: '0 0 16px 0',
}

const button = {
  backgroundColor: '#0071e3',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '14px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '10px 20px',
  fontWeight: '500',
};

const tableContainer = {
  marginTop: '32px',
};

const tableHeader = {
  fontSize: '12px',
  color: '#999999',
  textTransform: 'uppercase' as const,
};

const tableRow = {
  margin: '12px 0',
};

const tableCellTotal = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#1d1d1f',
};

const tableCellPrice = {
  ...text,
  textAlign: 'right' as const,
};

const tableCellPriceTotal = {
    ...tableCellTotal,
    textAlign: 'right' as const,
}

const hr = {
  borderColor: '#eaeaea',
  margin: '20px 0',
};

const footer = {
  marginTop: '32px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#999999',
  fontSize: '12px',
  lineHeight: '16px',
};

const footerLink = {
  color: '#0071e3',
  fontSize: '12px',
};

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Link,
} from '@react-email/components';
import * as React from 'react';
import type { DigitalProduct } from '@/lib/types';

interface PurchaseConfirmationEmailProps {
  userName: string;
  product: DigitalProduct;
  orderId: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:9002';
  
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  border: '1px solid #eaeaea',
  borderRadius: '4px',
};

const box = {
  padding: '0 48px',
};

const logo = {
  margin: '0 auto',
};

const h1 = {
  color: '#1d1c1d',
  fontSize: '36px',
  fontWeight: '700',
  margin: '30px 0',
  padding: '0',
  lineHeight: '42px',
};

const paragraph = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
};

const anchor = {
  color: '#556cd6',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
};

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
};

export const PurchaseConfirmationEmail = ({
  userName,
  product,
  orderId,
}: PurchaseConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Konfirmasi Pembelian Produk Digital Mood Lab</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Text style={h1}>Mood Lab</Text>
          <Heading as="h2" style={{ fontSize: '24px' }}>Terima kasih atas pembelian Anda, {userName}!</Heading>
          <Text style={paragraph}>
            Kami telah menerima pembayaran Anda untuk produk digital berikut. Anda dapat mengakses atau mengunduh produk Anda kapan saja.
          </Text>
          <Hr style={hr} />

          <Section style={{ marginBottom: '24px' }}>
            <Img
              src={product.imageUrl}
              width="120"
              height="90"
              alt={product.name}
              style={{ objectFit: 'cover', borderRadius: '4px', float: 'left', marginRight: '20px' }}
            />
            <Text style={{ ...paragraph, margin: 0, fontWeight: 'bold' }}>{product.name}</Text>
            <Text style={{ ...paragraph, margin: '4px 0 0 0', fontSize: '14px' }}>{product.description}</Text>
          </Section>
          
          <Hr style={hr} />
          
          <Text style={paragraph}>
            <strong>Detail Pesanan:</strong>
          </Text>
          <Text style={{...paragraph, margin: 0}}><strong>ID Pesanan:</strong> {orderId}</Text>
          <Text style={{...paragraph, margin: 0}}><strong>Total Pembayaran:</strong> {formatPrice(product.price)}</Text>
          
          <Text style={paragraph}>
            Jika Anda memiliki pertanyaan, jangan ragu untuk membalas email ini atau hubungi kami melalui halaman <Link style={anchor} href={`${baseUrl}/kontak`}>kontak kami</Link>.
          </Text>

          <Text style={paragraph}>— Tim Mood Lab</Text>
          <Hr style={hr} />
          <Text style={footer}>
            Mood Lab Digital, Agensi Penerjemah Budaya.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default PurchaseConfirmationEmail;

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
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';
import type { Order } from '@/lib/types';

interface PurchaseConfirmationEmailProps {
  userName: string;
  order: Order;
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

const tableCell = {
  padding: '8px 0',
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
};

export const PurchaseConfirmationEmail = ({
  userName,
  order,
  orderId,
}: PurchaseConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Konfirmasi Pembelian Mood Lab - Pesanan #{orderId}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Text style={h1}>Mood Lab</Text>
          <Heading as="h2" style={{ fontSize: '24px' }}>Terima kasih atas pesanan Anda, {userName}!</Heading>
          <Text style={paragraph}>
            Pesanan Anda telah kami terima dan sedang kami proses. Berikut adalah detail pesanan Anda.
          </Text>
          <Text style={paragraph}>
            ID Pesanan: <strong>#{orderId}</strong>
          </Text>
          <Hr style={hr} />

          {order.items.map((item) => (
             <Section key={item.id} style={{ marginBottom: '16px' }}>
              <Row>
                <Column style={{ width: '64px' }}>
                   <Img
                      src={item.imageUrl}
                      width="64"
                      height="64"
                      alt={item.name}
                      style={{ objectFit: 'cover', borderRadius: '4px' }}
                    />
                </Column>
                <Column style={{ paddingLeft: '16px', verticalAlign: 'top' }}>
                   <Text style={{ ...paragraph, margin: 0, fontWeight: 'bold' }}>{item.name}</Text>
                   <Text style={{ ...paragraph, margin: '4px 0 0 0', fontSize: '14px' }}>
                    {item.quantity} x {formatPrice(item.price)}
                  </Text>
                </Column>
                 <Column style={{ verticalAlign: 'top', textAlign: 'right' }}>
                  <Text style={{...paragraph, margin: 0, fontWeight: 'bold' }}>{formatPrice(item.quantity * item.price)}</Text>
                </Column>
              </Row>
          </Section>
          ))}
          
          <Hr style={hr} />

          <Section>
            <Row>
              <Column style={{...tableCell}}>
                <Text style={{...paragraph, margin: 0}}>Subtotal</Text>
              </Column>
              <Column style={{...tableCell, textAlign: 'right'}}>
                <Text style={{...paragraph, margin: 0}}>{formatPrice(order.totalAmount)}</Text>
              </Column>
            </Row>
             <Row>
              <Column style={{...tableCell}}>
                <Text style={{...paragraph, margin: 0}}>Ongkos Kirim</Text>
              </Column>
              <Column style={{...tableCell, textAlign: 'right'}}>
                <Text style={{...paragraph, margin: 0}}>{formatPrice(0)}</Text>
              </Column>
            </Row>
            <Row>
              <Column style={{...tableCell}}>
                <Text style={{...paragraph, margin: 0, fontWeight: 'bold'}}>Total</Text>
              </Column>
              <Column style={{...tableCell, textAlign: 'right'}}>
                <Text style={{...paragraph, margin: 0, fontWeight: 'bold'}}>{formatPrice(order.totalAmount)}</Text>
              </Column>
            </Row>
          </Section>
          
          <Hr style={hr} />

          <Text style={paragraph}>
            Anda dapat melihat detail pesanan dan statusnya kapan saja melalui halaman{' '}
            <Link style={anchor} href={`${baseUrl}/akun/riwayat-pesanan/${orderId}`}>
              Riwayat Pesanan Anda
            </Link>.
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

    
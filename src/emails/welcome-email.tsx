import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  userName: string;
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

export const WelcomeEmail = ({
  userName,
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Selamat datang di keluarga Mood Lab!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Text style={h1}>Mood Lab</Text>
          <Heading as="h2" style={{ fontSize: '26px' }}>Selamat datang, {userName}!</Heading>
          <Text style={paragraph}>
            Terima kasih telah bergabung dengan Mood Lab. Kami sangat senang Anda ada di sini.
          </Text>
          <Text style={paragraph}>
            Sekarang Anda dapat mulai menjelajahi produk-produk digital kami, membaca portofolio kami, atau menghubungi kami jika Anda memiliki ide brilian untuk didiskusikan.
          </Text>
          <Text style={paragraph}>
            Untuk memulai, Anda bisa mengunjungi halaman <Link style={anchor} href={`${baseUrl}/produk`}>produk kami</Link>.
          </Text>
          <Text style={paragraph}>
            Jika Anda memiliki pertanyaan, jangan ragu untuk membalas email ini. Kami selalu siap membantu.
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

export default WelcomeEmail;

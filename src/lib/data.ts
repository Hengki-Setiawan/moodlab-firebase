import type { NavItem, Service, TeamMember, Value } from './types';
import { Video, Megaphone, Lightbulb, ShoppingCart } from 'lucide-react';

export const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Tentang Kami', href: '/tentang-kami' },
  { label: 'Produk Digital', href: '/produk' },
  { label: 'Portofolio', href: '/portofolio' },
  { label: 'Kontak', href: '/kontak' },
];

export const services: Service[] = [
  {
    title: 'Pembuatan Konten Kekinian',
    description: 'Video, Meme, Postingan.',
    longDescription: 'Kami merancang dan memproduksi konten yang tidak hanya viral tetapi juga relevan. Dari video pendek yang menarik di TikTok hingga meme yang relate dan postingan Instagram yang engaging, kami memastikan pesan merek Anda tersampaikan dengan cara yang paling otentik dan disukai Gen Z.',
    icon: Video,
    image: 'service-content'
  },
  {
    title: 'Iklan Digital',
    description: 'TikTok & Instagram Ads.',
    longDescription: 'Maksimalkan jangkauan Anda dengan kampanye iklan digital yang tertarget. Kami mengelola TikTok dan Instagram Ads dari A sampai Z, mulai dari perencanaan, pembuatan materi iklan, penargetan audiens, hingga optimasi untuk memastikan ROI terbaik.',
    icon: Megaphone,
    image: 'service-ads'
  },
  {
    title: 'Konsultasi Strategi Merek',
    description: 'Analisis & Perencanaan.',
    longDescription: 'Bingung bagaimana cara terhubung dengan pasar muda? Kami menyediakan sesi konsultasi mendalam untuk menganalisis posisi merek Anda, memahami audiens, dan merancang roadmap strategi yang actionable untuk pertumbuhan jangka panjang.',
    icon: Lightbulb,
    image: 'service-strategy'
  },
  {
    title: 'Penjualan Produk Digital',
    description: 'E-books, kursus, dan lainnya.',
    longDescription: 'Ubah keahlian Anda menjadi sumber pendapatan. Kami membantu UMKM dalam membuat, mengemas, dan menjual produk digital seperti e-book, kursus online, atau template, membuka aliran pendapatan baru untuk bisnis Anda.',
    icon: ShoppingCart,
    image: 'service-products'
  },
];

export const projects = [
  {
    clientName: 'Kopi Kenangan',
    title: 'Kampanye Peluncuran Menu Baru',
    category: 'Kampanye Instagram',
    image: 'portfolio-1',
    description: 'Meningkatkan awareness dan penjualan menu baru melalui serangkaian konten Instagram Stories interaktif dan kolaborasi dengan food vlogger.'
  },
  {
    clientName: 'Erigo',
    title: 'TikTok Challenge #GayaErigo',
    category: 'Konten TikTok',
    image: 'portfolio-2',
    description: 'Membuat challenge viral di TikTok yang berhasil mengumpulkan jutaan views dan meningkatkan brand association dengan fashion anak muda.'
  },
  {
    clientName: 'Somethinc',
    title: 'Revitalisasi Strategi Konten',
    category: 'Strategi Merek',
    image: 'portfolio-3',
    description: 'Menganalisis tren kecantikan di kalangan Gen Z dan merumuskan pilar konten baru yang lebih relevan dan engaging, meningkatkan interaksi hingga 200%.'
  },
  {
    clientName: 'Kelas.com',
    title: 'Kursus Online "Content Creator 101"',
    category: 'Produk Digital',
    image: 'portfolio-4',
    description: 'Mengembangkan dan memasarkan kursus online yang membantu talenta muda memulai karir sebagai content creator, terjual lebih dari 1000 unit dalam bulan pertama.'
  }
];


export const team: TeamMember[] = [
  {
    name: 'Hengki',
    role: 'CEO/Founder & Cultural Strategist',
    image: 'team-hengki'
  },
  {
    name: 'Taufik',
    role: 'Content Creator & Ads Specialist',
    image: 'team-taufik'
  },
  {
    name: 'Zulfadly',
    role: 'Community & Performance Analyst',
    image: 'team-zulfadly'
  }
];

export const values: Value[] = [
    {
        title: 'Empati Digital',
        description: 'Kami menyelami dunia digital audiens Anda untuk memahami apa yang benar-benar mereka rasakan dan butuhkan.'
    },
    {
        title: "Obsesi pada 'Mengapa'",
        description: 'Setiap strategi dan konten yang kami buat didasari oleh pemahaman mendalam tentang motivasi di balik sebuah tren.'
    },
    {
        title: 'Komunikasi Jujur',
        description: 'Kami percaya pada transparansi. Kami menyampaikan data apa adanya dan memberikan rekomendasi yang tulus demi kesuksesan Anda.'
    },
    {
        title: 'Adaptif & Responsif',
        description: 'Di dunia yang terus berubah, kami bergerak cepat untuk menyesuaikan strategi dan menangkap setiap peluang yang muncul.'
    }
]

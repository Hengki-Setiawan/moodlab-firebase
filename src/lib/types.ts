import type { LucideIcon } from 'lucide-react';

export type NavItem = {
  label: string;
  href: string;
};

export type Service = {
  title: string;
  description: string;
  longDescription: string;
  icon: LucideIcon;
  image: string;
};

export type Project = {
  client: string;
  title: string;
  category: 'Konten TikTok' | 'Kampanye Instagram' | 'Strategi Merek' | 'Produk Digital';
  image: string;
  description: string;
};

export type TeamMember = {
  name: string;
  role: string;
  image: string;
};

export type Value = {
    title: string;
    description: string;
};

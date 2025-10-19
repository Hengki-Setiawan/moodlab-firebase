import type { LucideIcon } from 'lucide-react';
import type { Timestamp } from 'firebase/firestore';

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
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  clientName: string;
  caseStudyUrl?: string;
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

export type DigitalProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  fileUrl: string; // URL to the downloadable file
  imageHint: string;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
};

export type Order = {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'processed' | 'shipped' | 'completed' | 'cancelled';
  createdAt: Timestamp;
};

    
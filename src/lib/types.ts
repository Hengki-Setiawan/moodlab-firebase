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

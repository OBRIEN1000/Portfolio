export interface Profile {
  name: string;
  title: string;
  institution: string;
  bio: string;
  avatarUrl: string;
  email: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  footerText?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string; // Markdown-ish text
  date: string;
  tags: string[];
  imageUrl?: string;
  videoUrl?: string; // YouTube or other link
  type: 'newsletter' | 'journal'; // Newsletter is public/polished, Journal is rough notes
}

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  journal: string;
  year: number;
  pdfUrl?: string;
  tags: string[];
}

export enum ViewMode {
  PUBLIC = 'PUBLIC',
  ADMIN = 'ADMIN'
}

export type ContentType = 'articles' | 'papers' | 'journal';
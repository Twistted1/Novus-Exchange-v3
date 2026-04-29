export enum Page {
  Home = 'home',
  Mission = 'mission',
  Articles = 'articles',
  GlobalTrending = 'trending',
  Ecosystem = 'ecosystem',
  Author = 'Author', // Internal page, not in nav
  Article = 'Article', // Internal page, not in nav
}

export interface Author {
  id: string;
  name: string;
  avatarUrl: string;
  bio: string;
}

export interface Article {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  category: string;
  author: Author;
  date: string;
  readTime: number; // in minutes
  tags: string[];
  sourceUrl?: string;
}

export interface Broadcast {
  id: string;
  title: string;
  description: string;
  date: string;
  videoUrl?: string; // For the video podcast output
  audioUrl?: string; // For the audio podcast output
  thumbnailUrl: string;
  tags: string[];
  duration: string;
  schedule: string; // e.g., "MON-WED-SAT"
}

export interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  date: string;
  episodeNumber: number;
  season: number;
  audioUrl: string;
  thumbnailUrl: string;
  duration: string;
  tags: string[];
}

export interface NovusMessage {
  id: number;
  source: 'user' | 'model';
  text?: string;
  imageUrl?: string;
  isLoading?: boolean;
}

export type AskNovusHighlightFn = (text: string) => void;
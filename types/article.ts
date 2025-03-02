export interface Article {
  id: number;
  title: string;
  url: string;
  points: number;
  author: string;
  createdAt: string;
  commentCount: number;
  domain?: string;
} 
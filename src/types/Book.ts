export interface Book {
  id: number;
  title: string;
  author: string;
  year: number;
  discipline: string;
  condition: 'LIKE_NEW' | 'GOOD' | 'ACCEPTABLE';
  description: string;
  ownerId: number;
};
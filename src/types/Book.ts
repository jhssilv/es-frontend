export interface Book {
  id: number;       // identificador único (no nosso exemplo, gerado com Date.now())
  title: string;    // título do livro
  author: string;   // autor do livro
  year: number;     // ano de publicação (exemplo de campo extra)
}
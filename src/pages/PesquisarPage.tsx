import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

import type { Book } from '../types/Book';

const initialBooks: Book[] = [
  { id: 1, title: 'Dom Casmurro', author: 'Machado de Assis', year: 1899 },
  { id: 2, title: 'O Alquimista', author: 'Paulo Coelho', year: 1988 },
  { id: 3, title: 'Harry Potter e a Pedra Filosofal', author: 'J.K. Rowling', year: 1997 },
];

export default function BookSearchPage() {
  const [books] = useState<Book[]>(initialBooks);
  const [results, setResults] = useState<Book[]>(initialBooks);
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    const q = query.trim().toLowerCase();
    setResults(
      q
        ? books.filter(
            ({ title, author }) =>
              title.toLowerCase().includes(q) ||
              author.toLowerCase().includes(q)
          )
        : books
    );
  };

  const handleClear = () => {
    setQuery('');
    setResults(books);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 4 } }}>
      <Typography variant="h4" gutterBottom align="center">
        Busca de Livros
      </Typography>

      {/* Responsive search bar using Stack */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems="center"
        sx={{ mb: { xs: 1, sm: 2 } }}
      >
        <TextField
          label="Pesquisar por título ou autor"
          variant="outlined"
          fullWidth
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
          >
            Buscar
          </Button>
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={handleClear}
          >
            Limpar
          </Button>
        </Stack>
      </Stack>

      {results.length === 0 ? (
        <Typography align="center">Nenhum livro encontrado.</Typography>
      ) : (
        <TableContainer
          component={Paper}
          sx={{ maxHeight: { xs: '50vh', sm: '60vh' }, overflowX: 'auto' }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Título</TableCell>
                <TableCell>Autor</TableCell>
                <TableCell>Ano</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((book) => (
                <TableRow key={book.id} hover>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>{book.year}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

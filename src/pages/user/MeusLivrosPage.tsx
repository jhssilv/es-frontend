import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import type { Book } from '../../types/Book';

export default function MeusLivrosPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  /** 
   * Estado para saber se o diálogo está em modo “edição” ou “criação”.
   * - Se for null, significa que estou criando um novo livro.
   * - Se contiver um Book, significa que estou editando esse livro.
   */
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  /** Campos temporários para título, autor e ano dentro do formulário */
  const [tempTitle, setTempTitle] = useState('');
  const [tempAuthor, setTempAuthor] = useState('');
  const [tempYear, setTempYear] = useState<number | ''>('');

  // ------------ FUNÇÕES AUXILIARES ------------

  /** Abre o diálogo em modo “criar” (limpa campos) */
  function handleOpenNewBookDialog() {
    setEditingBook(null);
    setTempTitle('');
    setTempAuthor('');
    setTempYear('');
    setDialogOpen(true);
  }

  /**
   * Abre o diálogo em modo “editar”
   * Recebe o livro que será editado para preencher os campos
   */
  function handleOpenEditBookDialog(book: Book) {
    setEditingBook(book);
    setTempTitle(book.title);
    setTempAuthor(book.author);
    setTempYear(book.year);
    setDialogOpen(true);
  }

  /** Fecha o diálogo (seja em criação ou edição) */
  function handleCloseDialog() {
    setDialogOpen(false);
    setEditingBook(null);
  }

  /**
   * Salva (cria ou atualiza) um livro:
   * - Se estiver em edição (editingBook !== null), atualiza o livro na lista.
   * - Senão, cria um livro novo com ID gerado via Date.now().
   */
  function handleSaveBook() {
    if (tempTitle.trim() === '' || tempAuthor.trim() === '' || tempYear === '') {
      // Aqui você poderia mostrar um alerta ou mensagem de erro se algum campo estiver vazio.
      return;
    }

    if (editingBook) {
      // Modo edição: atualiza o livro existente
      setBooks(prev =>
        prev.map(b => {
          if (b.id === editingBook.id) {
            return { ...b, title: tempTitle, author: tempAuthor, year: Number(tempYear) };
          }
          return b;
        })
      );
    } else {
      // Modo criação: adiciona um livro novo à lista
      const newBook: Book = {
        id: Date.now(), // usar Date.now() só como exemplo de ID único rápido
        title: tempTitle,
        author: tempAuthor,
        year: Number(tempYear),
      };
      setBooks(prev => [...prev, newBook]);
    }

    // Fecha o diálogo e limpa o estado de edição
    handleCloseDialog();
  }

  /**
   * Remove um livro da lista a partir do ID.
   * Você pode adicionar um “confirm dialog” antes de chamar essa função, se quiser.
   */
  function handleDeleteBook(id: number) {
    setBooks(prev => prev.filter(b => b.id !== id));
  }
  return (
    <Box>
      {/** Botão para abrir o diálogo de “Novo Livro” */}
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleOpenNewBookDialog}
        sx={{ mb: 2 }}
      >
        Publicar Novo Livro
      </Button>

      {/** Se não houver livros, mostramos uma mensagem */}
      {books.length === 0 ? (
        <Typography>Você ainda não publicou nenhum livro.</Typography>
      ) : (
        /** Se houver livros, mostramos em uma tabela */
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Título</TableCell>
                <TableCell>Autor</TableCell>
                <TableCell>Ano</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {books.map(book => (
                <TableRow key={book.id}>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>{book.year}</TableCell>
                  <TableCell align="right">
                    {/** Botão de Editar */}
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenEditBookDialog(book)}
                    >
                      <EditIcon />
                    </IconButton>

                    {/** Botão de Remover */}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteBook(book.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/**
       * Diálogo para criar ou editar um livro.
       * - Se editingBook é null, estamos em “criar” (título do diálogo: “Publicar Livro”).
       * - Se editingBook não é null, estamos em “editar” (título: “Editar Livro”).
       */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingBook ? 'Editar Livro' : 'Publicar Livro'}</DialogTitle>
        <DialogContent>
          {/** Campo para Título */}
          <TextField
            autoFocus
            margin="dense"
            label="Título"
            type="text"
            fullWidth
            variant="outlined"
            value={tempTitle}
            onChange={e => setTempTitle(e.target.value)}
          />

          {/** Campo para Autor */}
          <TextField
            margin="dense"
            label="Autor"
            type="text"
            fullWidth
            variant="outlined"
            value={tempAuthor}
            onChange={e => setTempAuthor(e.target.value)}
          />

          {/** Campo para Ano */}
          <TextField
            margin="dense"
            label="Ano de Publicação"
            type="number"
            fullWidth
            variant="outlined"
            value={tempYear}
            onChange={e => {
              // Permitimos somente números inteiros
              const val = e.target.value;
              if (val === '') {
                setTempYear('');
              } else if (!isNaN(Number(val))) {
                setTempYear(Number(val));
              }
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveBook}>
            {editingBook ? 'Salvar Alterações' : 'Publicar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

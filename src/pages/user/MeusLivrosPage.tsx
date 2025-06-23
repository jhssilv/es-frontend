import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

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
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { type Book } from '../../types/Book';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../../components/functions/useAuth';

// Opções para os campos de seleção
const disciplines = ['Ciências Exatas', 'Ciências Humanas', 'Literatura', 'Artes', 'Outro'];
// Atualizando as opções de condição do livro
const conditions = [
  { value: 'LIKE_NEW', label: 'Como Novo' },
  { value: 'GOOD', label: 'Bom' },
  { value: 'ACCEPTABLE', label: 'Aceitável' },
];

// --- Componente Principal ---
export default function MeusLivrosPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const {user} = useAuth();

  // Estados para o formulário
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    year: '' as number | '',
    discipline: '',
    condition: 'GOOD',
    description: '',
  });

  // Estados de controle da UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Funções da API ---
  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Rota para buscar livros do usuário logado (ex: /books?ownerId=1)
      const response = await axios.get(`/books/user/${user?.id}`);
      // A API /books retorna um objeto com "items", então pegamos a lista de dentro
      console.log(response);
      setBooks(response.data.items || []);
    } catch (err) {
      console.error("Erro ao buscar livros:", err);
      setError('Falha ao carregar seus livros. Tente recarregar a página.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  const handleOpenNewBookDialog = () => {
    setEditingBook(null);
    setFormData({
      title: '', author: '', year: '', discipline: '',
      condition: 'GOOD', description: '',
    });
    setDialogOpen(true);
    setFormError(null);
  };

  const handleOpenEditBookDialog = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      year: book.year,
      discipline: book.discipline,
      condition: book.condition,
      description: book.description,
    });
    setDialogOpen(true);
    setFormError(null);
  };

  const handleCloseDialog = () => {
    if (isSubmitting) return;
    setDialogOpen(false);
    setEditingBook(null);
  };

  const handleSaveBook = async () => {
    if (!formData.title || !formData.author || !formData.year) {
      setFormError('Título, autor e ano são obrigatórios.');
      return;
    }
    setFormError(null);
    setIsSubmitting(true);

    const bookData = { ...formData, year: Number(formData.year), ownerId: user?.id };

    try {
      if (editingBook) {
        const { data: updatedBook } = await axios.patch(`/books/${editingBook.id}`, bookData);
        setBooks(prev => prev.map(b => (b.id === editingBook.id ? updatedBook : b)));
      } else {
        // Modo Criação
        const { data: newBook } = await axios.post('/books', bookData);
        setBooks(prev => [...prev, newBook]);
      }
      handleCloseDialog();
    } catch (err) {
      console.error("Erro ao salvar livro:", err);
      setFormError('Não foi possível salvar o livro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBook = async (id: number) => {
    // Adicionar uma confirmação real seria uma boa prática
    if (window.confirm('Tem certeza que deseja remover este livro?')) {
      try {
        await axios.delete(`/books/${id}`);
        setBooks(prev => prev.filter(b => b.id !== id));
      } catch (err) {
        console.error("Erro ao deletar livro:", err);
        // Mostrar um alerta/toast de erro para o usuário
        alert('Não foi possível remover o livro.');
      }
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleOpenNewBookDialog}
        sx={{ mb: 2 }}
      >
        Publicar Novo Livro
      </Button>

      {books.length === 0 ? (
        <Typography>Você ainda não publicou nenhum livro.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Título</TableCell>
                <TableCell>Autor</TableCell>
                <TableCell>Ano</TableCell>
                <TableCell>Condição</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {books.map(book => (
                <TableRow key={book.id} hover>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>{book.year}</TableCell>
                  <TableCell>{conditions.find(c => c.value === book.condition)?.label || book.condition}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary" onClick={() => handleOpenEditBookDialog(book)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteBook(book.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingBook ? 'Editar Livro' : 'Publicar Livro'}</DialogTitle>
        <DialogContent>
          <TextField autoFocus name="title" margin="dense" label="Título" type="text" fullWidth variant="outlined" value={formData.title} onChange={handleInputChange} />
          <TextField name="author" margin="dense" label="Autor" type="text" fullWidth variant="outlined" value={formData.author} onChange={handleInputChange} />
          <TextField name="year" margin="dense" label="Ano de Publicação" type="number" fullWidth variant="outlined" value={formData.year} onChange={handleInputChange} />
          
          <FormControl fullWidth margin="dense">
            <InputLabel>Disciplina</InputLabel>
            <Select name="discipline" label="Disciplina" value={formData.discipline} onChange={handleSelectChange}>
              {disciplines.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="dense">
            <InputLabel>Condição</InputLabel>
            <Select name="condition" label="Condição" value={formData.condition} onChange={handleSelectChange}>
              {conditions.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
            </Select>
          </FormControl>

          <TextField name="description" margin="dense" label="Descrição (opcional)" type="text" multiline rows={3} fullWidth variant="outlined" value={formData.description} onChange={handleInputChange} />

          {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isSubmitting}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveBook} disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : (editingBook ? 'Salvar Alterações' : 'Publicar')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
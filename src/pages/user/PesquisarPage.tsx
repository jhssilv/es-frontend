import { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // Importando axios
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
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Modal from '@mui/material/Modal';
import Checkbox from '@mui/material/Checkbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Divider from '@mui/material/Divider';
import { useAuth } from '../../components/functions/useAuth';
import { type Book } from '../../types/Book';

import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

type PaginationMeta = {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
};


// --- Componente Principal ---
export default function PesquisarPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMyBooks, setLoadingMyBooks] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {user} = useAuth();
  
  // State para o Modal de Troca
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [mySelectedBooks, setMySelectedBooks] = useState<number[]>([]);
  const [exchangeFeedback, setExchangeFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const fetchBooks = useCallback(async (currentPage = 1, searchQuery = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/books', {
        params: {
          query: searchQuery,
          page: currentPage,
          limit: 5,
        },
      });
      setBooks(response.data.items);
      setMeta(response.data.meta);
    } catch (err) {
      console.error("Erro ao buscar livros:", err);
      setError('Falha ao buscar os livros. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Busca os livros do usuário logado ao carregar o componente
  useEffect(() => {
    const fetchMyBooks = async () => {
        setLoadingMyBooks(true);
        try {
            const { data } = await axios.get(`/books/user/${user?.id}`);
            console.log(data);
            setMyBooks(data.items || []);
        } catch (e) {
            console.error("Erro ao buscar 'meus livros':", e);
            // Poderia ter um state de erro específico para esta falha
        } finally {
            setLoadingMyBooks(false);
        }
    };
    fetchMyBooks();
  }, []);

  useEffect(() => {
    fetchBooks(1, '');
  }, [fetchBooks]);

  const handleSearch = () => {
    fetchBooks(1, query);
  };

  const handleClear = () => {
    setQuery('');
    fetchBooks(1, '');
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && meta && newPage <= meta.totalPages) {
      fetchBooks(newPage, query);
    }
  };
  
  const handleOpenModal = (book: Book) => {
    setSelectedBook(book);
    setModalOpen(true);
    setMySelectedBooks([]);
    setExchangeFeedback(null);
  };
  
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedBook(null);
  };
  
  const handleToggleMyBook = (bookId: number) => {
    const currentIndex = mySelectedBooks.indexOf(bookId);
    const newChecked = [...mySelectedBooks];

    if (currentIndex === -1) {
      newChecked.push(bookId);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setMySelectedBooks(newChecked);
  };
  
   
const handleProposeExchange = async () => {
    if (!user) {
        setExchangeFeedback({type: 'error', message: 'Sessão inválida. Por favor, faça login novamente.'});
        return;
    }

    if (!selectedBook || mySelectedBooks.length === 0) {
        setExchangeFeedback({ type: 'error', message: 'Você precisa selecionar um livro para pedir e ao menos um para oferecer.' });
        return;
    }

    const completionDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const exchangePromises = mySelectedBooks.map(currentRequesterBookId => {
        const payload = {
            requesterId: user.id,
            providerId: selectedBook.ownerId,
            requesterBookId: currentRequesterBookId,
            providerBookId: selectedBook.id,
            completionDate: completionDate,
        };
        return axios.post('/exchanges', payload);
    });

    try {
        await Promise.all(exchangePromises);
        
        setExchangeFeedback({ type: 'success', message: `Propostas de troca por "${selectedBook.title}" enviadas com sucesso!` });
        
        setTimeout(handleCloseModal, 2000);

    } catch (e) {
        console.error("Erro ao criar troca(s):", e);
        setExchangeFeedback({ type: 'error', message: 'Ocorreu um erro ao propor a troca.' });
    }
};

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>      
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Pesquisar por título ou autor"
          variant="outlined"
          fullWidth
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Stack direction="row" spacing={1} sx={{ minWidth: 'fit-content' }}>
          <Button variant="contained" startIcon={<SearchIcon />} onClick={handleSearch}>
            Buscar
          </Button>
          <Button variant="outlined" startIcon={<ClearIcon />} onClick={handleClear}>
            Limpar
          </Button>
        </Stack>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : books.length === 0 ? (
        <Typography align="center" sx={{ my: 4 }}>Nenhum livro encontrado.</Typography>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ maxHeight: '60vh', overflowX: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Título</TableCell>
                  <TableCell>Autor</TableCell>
                  <TableCell>Ano</TableCell>
                  <TableCell>Dono(a)</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {books.map((book) => (
                  <TableRow key={book.id} hover>
                    <TableCell>{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>{book.year}</TableCell>
                    <TableCell>{book.ownerId}</TableCell>
                    <TableCell align="center">
                      <Button 
                        variant="outlined" 
                        size="small" 
                        startIcon={<SwapHorizIcon />}
                        onClick={() => handleOpenModal(book)}
                      >
                        Trocar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {meta && meta.totalPages > 1 && (
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} sx={{ mt: 2 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => handlePageChange(meta.currentPage - 1)}
                disabled={meta.currentPage === 1}
              >
                Anterior
              </Button>
              <Typography>
                Página {meta.currentPage} de {meta.totalPages}
              </Typography>
              <Button
                endIcon={<ArrowForwardIcon />}
                onClick={() => handlePageChange(meta.currentPage + 1)}
                disabled={meta.currentPage === meta.totalPages}
              >
                Próxima
              </Button>
            </Stack>
          )}
        </>
      )}

      {/* Modal para Propor Troca */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 400, md: 500 },
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24, p: 4,
          borderRadius: 2
        }}>
            {selectedBook && (
                <>
                    <Typography variant="h6" component="h2">
                        Propor Troca
                    </Typography>
                    <Typography sx={{ mt: 2 }}>
                        Você quer o livro <strong>{selectedBook.title}</strong> de {selectedBook.ownerId}.
                    </Typography>
                    <Typography sx={{ mt: 1, mb: 2 }}>
                        Selecione um ou mais livros seus para oferecer em troca:
                    </Typography>
                    
                    <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
                        {loadingMyBooks ? (
                           <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                             <CircularProgress size={24} />
                           </Box>
                        ) : (
                          <List dense subheader={<ListSubheader>Meus Livros</ListSubheader>}>
                              {myBooks.map(book => (
                                  <ListItem key={book.id} disablePadding>
                                      <ListItemButton onClick={() => handleToggleMyBook(book.id)}>
                                          <ListItemIcon>
                                              <Checkbox
                                                  edge="start"
                                                  checked={mySelectedBooks.indexOf(book.id) !== -1}
                                                  tabIndex={-1}
                                                  disableRipple
                                              />
                                          </ListItemIcon>
                                          <ListItemText primary={book.title} secondary={book.author} />
                                      </ListItemButton>
                                  </ListItem>
                              ))}
                          </List>
                        )}
                    </Paper>

                    {exchangeFeedback && (
                        <Alert severity={exchangeFeedback.type} sx={{ mt: 2 }}>{exchangeFeedback.message}</Alert>
                    )}

                    <Divider sx={{ my: 2 }} />
                    
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button variant="outlined" onClick={handleCloseModal}>Cancelar</Button>
                        <Button variant="contained" onClick={handleProposeExchange} disabled={mySelectedBooks.length === 0 || loadingMyBooks}>
                            Confirmar Proposta
                        </Button>
                    </Stack>
                </>
            )}
        </Box>
      </Modal>
    </Box>
  );
}

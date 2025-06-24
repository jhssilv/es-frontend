import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
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
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';


// Tipos de dados para a página de gerenciamento de trocas
type ExchangeStatus = 'REQUESTED' | 'ACCEPTED' | 'REFUSED' | 'WAITING_APPROVAL' | 'COMPLETED' | 'CANCELED';

type Book = {
  id: number;
  title: string;
};

type User = {
    id: number;
    name: string;
}

// Tipo para a troca, achatado para facilitar o uso na UI
type Exchange = {
  id: number;
  status: ExchangeStatus;
  requestDate: string;
  requester: User;
  provider: User;
  requesterBook: Book;
  providerBook: Book;
};

// Tipo de dados como vem da API (com objetos aninhados)
type ApiExchange = {
  id: number;
  status: ExchangeStatus;
  requestDate: string;
  completionDate: string;
  requesterBook: {
      id: number;
      title: string;
      owner: User;
  };
  providerBook: {
      id: number;
      title: string;
      owner: User;
  }
};

// Funções auxiliares para status
const getFriendlyStatusName = (status: ExchangeStatus) => {
    const names = {
        REQUESTED: 'Requisitada',
        ACCEPTED: 'Aceita',
        REFUSED: 'Recusada',
        WAITING_APPROVAL: 'Aguardando Aprovação',
        COMPLETED: 'Concluída',
        CANCELED: 'Cancelada',
    };
    return names[status] || status;
};

const getStatusColor = (status: ExchangeStatus) => {
    const colors = {
        REQUESTED: 'primary.main',
        ACCEPTED: 'success.main',
        COMPLETED: 'success.main',
        REFUSED: 'error.main',
        CANCELED: 'error.main',
        WAITING_APPROVAL: 'warning.main',
    };
    return colors[status] || 'text.secondary';
}

export default function ExchangeManagementPage() {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // State para diálogos
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [exchangeToDelete, setExchangeToDelete] = useState<Exchange | null>(null);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [exchangeToShowInfo, setExchangeToShowInfo] = useState<Exchange | null>(null);

  useEffect(() => {
    const fetchExchanges = async () => {
      try {
        setLoading(true);
        setError(null);
        // Assumindo um endpoint para moderadores buscarem todas as trocas
        const response = await axios.get('/exchanges'); 
        const exchangeList: ApiExchange[] = response.data.items || response.data;

        if (!Array.isArray(exchangeList)) {
            throw new Error("Formato de dados inesperado recebido do servidor.");
        }
        
        // Mapeia os dados da API para o formato que a UI usará
        const mappedExchanges: Exchange[] = exchangeList.map(apiExchange => ({
          id: apiExchange.id,
          status: apiExchange.status,
          requestDate: apiExchange.requestDate,
          requester: apiExchange.requesterBook.owner,
          provider: apiExchange.providerBook.owner,
          requesterBook: { id: apiExchange.requesterBook.id, title: apiExchange.requesterBook.title },
          providerBook: { id: apiExchange.providerBook.id, title: apiExchange.providerBook.title },
        }));

        setExchanges(mappedExchanges);
      } catch (err) {
        console.error("Falha ao buscar trocas:", err);
        setError("Não foi possível carregar os dados das propostas de troca.");
      } finally {
        setLoading(false);
      }
    };

    fetchExchanges();
  }, []);

  const filteredExchanges = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return exchanges;
    return exchanges.filter(
      ({ requester, provider, requesterBook, providerBook }) =>
        requester.name.toLowerCase().includes(q) ||
        provider.name.toLowerCase().includes(q) ||
        requesterBook.title.toLowerCase().includes(q) ||
        providerBook.title.toLowerCase().includes(q)
    );
  }, [exchanges, searchTerm]);

  const handleStatusChange = async (exchangeId: number, newStatus: ExchangeStatus) => {
    const originalExchanges = [...exchanges];
    
    // Atualização otimista da UI
    setExchanges(prevExchanges =>
      prevExchanges.map(ex => (ex.id === exchangeId ? { ...ex, status: newStatus } : ex))
    );

    try {
      // Endpoint PATCH para atualizar a troca
      await axios.patch(`/exchanges/${exchangeId}`, { status: newStatus });
    } catch (err) {
      console.error(`Falha ao atualizar o status da troca ${exchangeId}:`, err);
      // Reverte a mudança na UI em caso de erro
      setExchanges(originalExchanges);
      alert('Não foi possível atualizar o status da proposta. Tente novamente.');
    }
  };

  const confirmDelete = (exchange: Exchange) => {
    setExchangeToDelete(exchange);
    setDeleteConfirmDialogOpen(true);
  };

  const handleDeleteExchange = async () => {
    if (exchangeToDelete) {
      try {
        // Endpoint para deletar a troca
        await axios.delete(`/exchanges/${exchangeToDelete.id}`);
        setExchanges(prevExchanges => prevExchanges.filter(ex => ex.id !== exchangeToDelete.id));
      } catch (err) {
          console.error(`Falha ao excluir a troca ${exchangeToDelete.id}:`, err);
          alert('Não foi possível excluir a proposta.');
      } finally {
        setDeleteConfirmDialogOpen(false);
        setExchangeToDelete(null);
      }
    }
  };

  const handleOpenInfoDialog = (exchange: Exchange) => {
    setExchangeToShowInfo(exchange);
    setInfoDialogOpen(true);
  };

  if (loading) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Carregando propostas...</Typography>
        </Box>
    );
  }

  if (error) {
    return (
        <Box sx={{ p: 4 }}>
            <Alert severity="error">{error}</Alert>
        </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 4 } }}>
      <TextField
        label="Pesquisar por usuário ou livro"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          endAdornment: (
            <IconButton onClick={() => setSearchTerm('')} edge="end">
              <ClearIcon />
            </IconButton>
          )
        }}
      />
      
      {filteredExchanges.length === 0 ? (
        <Typography align="center" variant="h6" sx={{ mt: 4 }}>
          Nenhuma proposta de troca encontrada.
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: '70vh' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Solicitante (Oferece)</TableCell>
                <TableCell>Provedor (Deseja)</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Data</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredExchanges.map(exchange => (
                <TableRow key={exchange.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">{exchange.requester.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{exchange.requesterBook.title}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">{exchange.provider.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{exchange.providerBook.title}</Typography>
                  </TableCell>
                   <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    {format(new Date(exchange.requestDate), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Alterar Status">
                      <FormControl fullWidth size="small">
                        <Select
                          value={exchange.status}
                          onChange={(e: SelectChangeEvent<ExchangeStatus>) => handleStatusChange(exchange.id, e.target.value as ExchangeStatus)}
                          sx={{ fontWeight: 'medium', color: getStatusColor(exchange.status) }}
                        >
                          <MenuItem value="WAITING_APPROVAL">Aguardando Aprovação</MenuItem>
                          <MenuItem value="ACCEPTED">Aceita</MenuItem>
                          <MenuItem value="REFUSED">Recusada</MenuItem>
                          <MenuItem value="CANCELED">Cancelada</MenuItem>
                           <MenuItem value="COMPLETED">Concluída</MenuItem>
                        </Select>
                      </FormControl>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="Ver Detalhes">
                        <IconButton onClick={() => handleOpenInfoDialog(exchange)} size="small" color="info">
                          <InfoOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir Proposta">
                        <IconButton onClick={() => confirmDelete(exchange)} size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Diálogo de Confirmação de Exclusão */}
      <Dialog open={deleteConfirmDialogOpen} onClose={() => setDeleteConfirmDialogOpen(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir esta proposta de troca? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteExchange} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Informações da Troca */}
      <Dialog open={infoDialogOpen} onClose={() => setInfoDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Detalhes da Proposta</DialogTitle>
        <DialogContent dividers>
          {exchangeToShowInfo && (
            <Stack spacing={1.5}>
              <Typography><strong>ID da Troca:</strong> {exchangeToShowInfo.id}</Typography>
              <Typography><strong>Status:</strong> <span style={{color: getStatusColor(exchangeToShowInfo.status)}}>{getFriendlyStatusName(exchangeToShowInfo.status)}</span></Typography>
              <Typography><strong>Data da Solicitação:</strong> {format(new Date(exchangeToShowInfo.requestDate), 'dd/MM/yyyy \'às\' HH:mm')}</Typography>
              <Divider>Solicitante</Divider>
              <Typography><strong>Nome:</strong> {exchangeToShowInfo.requester.name}</Typography>
              <Typography><strong>Oferece o livro:</strong> {exchangeToShowInfo.requesterBook.title}</Typography>
              <Divider>Provedor</Divider>
              <Typography><strong>Nome:</strong> {exchangeToShowInfo.provider.name}</Typography>
              <Typography><strong>Possui o livro:</strong> {exchangeToShowInfo.providerBook.title}</Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoDialogOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}